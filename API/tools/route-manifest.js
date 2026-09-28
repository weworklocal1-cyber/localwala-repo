/**
 * LocalWala – route manifest tool
 *
 * Captures every registered route (method, full path, auth strategy,
 * required rights, validation presence) so migrations can be proven
 * behaviourally identical.
 *
 * Phase 0   : node tools/route-manifest.js
 * Phase 2   : node tools/route-manifest.js --out tools/route-manifest.fastify.json
 * parity    : node tools/route-manifest.js --diff tools/route-manifest.baseline.json
 *
 * How it works
 * ------------
 * Express 5 does not expose mount prefixes on Layer objects at rest, and
 * re-walking app.router loses information. Instead we instrument
 * express.Router *before* loading the route modules, so every .get/.post
 * and every .use(<prefix>, subRouter) is recorded at registration time
 * with the real string arguments.
 *
 * Requiring src/routes/v1 has no side effects (no firebase, no cron, no
 * mongoose connection), unlike src/app.js.
 */

const path = require('path');
const fs = require('fs');

const VERBS = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options', 'all'];

// ---------------------------------------------------------------------------
// CLI parsing
// ---------------------------------------------------------------------------
function parseArgs(argv) {
  const args = { out: null, diff: null, prefix: '/v1', quiet: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--out') args.out = argv[++i];
    else if (a === '--diff') args.diff = argv[++i];
    else if (a === '--prefix') args.prefix = argv[++i];
    else if (a === '--quiet') args.quiet = true;
    else if (a === '--help' || a === '-h') args.help = true;
  }
  return args;
}

// ---------------------------------------------------------------------------
// Path helpers
// ---------------------------------------------------------------------------
function joinPath(prefix, p) {
  const base = String(prefix || '').replace(/\/+$/, '');
  const rest = p === undefined || p === null ? '' : String(p);

  if (rest === '' || rest === '/') return base || '/';

  const joined = rest.startsWith('/') ? base + rest : `${base}/${rest}`;
  const collapsed = joined.replace(/\/{2,}/g, '/');
  return collapsed.startsWith('/') ? collapsed : `/${collapsed}`;
}

// ---------------------------------------------------------------------------
// Instrument express.Router
// ---------------------------------------------------------------------------
function instrument(router) {
  Object.defineProperty(router, '__manifest', {
    value: { mounts: [], routes: [] },
    enumerable: false,
    configurable: true,
  });

  for (const verb of VERBS) {
    const original = router[verb];
    if (typeof original !== 'function') continue;
    router[verb] = function instrumentedVerb(routePath, ...handlers) {
      router.__manifest.routes.push({
        method: verb.toUpperCase(),
        path: routePath,
        handlers,
      });
      return original.call(this, routePath, ...handlers);
    };
  }

  const originalUse = router.use;
  router.use = function instrumentedUse(first, ...rest) {
    if (typeof first === 'string' || Array.isArray(first)) {
      for (const candidate of rest) {
        if (candidate && candidate.__manifest) {
          router.__manifest.mounts.push({ path: first, router: candidate });
        }
      }
    } else if (first && first.__manifest) {
      router.__manifest.mounts.push({ path: '/', router: first });
    }
    return originalUse.call(this, first, ...rest);
  };

  return router;
}

function patchExpress(expressModule) {
  const originalRouter = expressModule.Router;
  const patched = function patchedRouter(...args) {
    return instrument(originalRouter.apply(this, args));
  };
  Object.assign(patched, originalRouter);
  patched.Router = patched;
  expressModule.Router = patched;
  return originalRouter;
}

// ---------------------------------------------------------------------------
// Middleware metadata
// ---------------------------------------------------------------------------
function describeHandler(handler) {
  if (typeof handler !== 'function') return { kind: 'other', label: String(handler) };

  if (handler.isAuth) {
    return {
      kind: 'auth',
      strategy: handler.authStrategy,
      rights: Array.isArray(handler.requiredRights) ? handler.requiredRights : [],
    };
  }
  if (handler.isValidate) return { kind: 'validate' };
  if (handler.name) return { kind: 'middleware', name: handler.name };
  return { kind: 'middleware', name: 'anonymous' };
}

// ---------------------------------------------------------------------------
// Flatten registration tree into absolute routes
// ---------------------------------------------------------------------------
function flatten(router, prefix, out) {
  const manifest = router.__manifest;
  if (!manifest) return;

  for (const mount of manifest.mounts) {
    flatten(mount.router, joinPath(prefix, mount.path), out);
  }

  for (const entry of manifest.routes) {
    const paths = Array.isArray(entry.path) ? entry.path : [entry.path];
    const described = entry.handlers.map(describeHandler);

    const authEntries = described.filter((d) => d.kind === 'auth');
    const rights = [];
    for (const a of authEntries) {
      for (const r of a.rights) if (!rights.includes(r)) rights.push(r);
    }

    for (const p of paths) {
      out.push({
        method: entry.method,
        path: joinPath(prefix, p),
        auth: authEntries.length ? authEntries[0].strategy : null,
        rights,
        validated: described.some((d) => d.kind === 'validate'),
        middleware: described.map((d) =>
          d.kind === 'auth'
            ? `auth:${d.strategy}${d.rights.length ? `(${d.rights.join('|')})` : ''}`
            : d.kind === 'validate'
              ? 'validate'
              : d.name
        ),
      });
    }
  }
}

function sortRoutes(routes) {
  return routes.slice().sort((a, b) => {
    if (a.path === b.path) return a.method.localeCompare(b.method);
    return a.path < b.path ? -1 : 1;
  });
}

function keyOf(route) {
  return `${route.method} ${route.path}`;
}

// ---------------------------------------------------------------------------
// Build
// ---------------------------------------------------------------------------
function buildManifest(prefix) {
  const expressModule = require('express');
  const originalRouter = patchExpress(expressModule);

  // Phase 2.9: src/routes/v1 exports `{ router, registerOnFastify }`; the
  // Express tree is still the one the baseline was captured from.
  const { router: routeIndex } = require(path.join(__dirname, '..', 'src', 'routes', 'v1'));

  const routes = [];
  flatten(routeIndex, prefix, routes);

  // Restore express so any later require in the same process is unaffected.
  expressModule.Router = originalRouter;

  const sorted = sortRoutes(routes);

  const seen = new Map();
  const duplicates = [];
  for (const r of sorted) {
    const k = keyOf(r);
    if (seen.has(k)) duplicates.push(k);
    else seen.set(k, true);
  }

  let expressVersion = 'unknown';
  try {
    expressVersion = require('express/package.json').version;
  } catch (_) {
    /* ignore */
  }

  return {
    meta: {
      generatedAt: new Date().toISOString(),
      prefix,
      expressVersion,
      totalRoutes: sorted.length,
      duplicates,
      authBreakdown: sorted.reduce((acc, r) => {
        const k = r.auth || 'public';
        acc[k] = (acc[k] || 0) + 1;
        return acc;
      }, {}),
      methodBreakdown: sorted.reduce((acc, r) => {
        acc[r.method] = (acc[r.method] || 0) + 1;
        return acc;
      }, {}),
    },
    routes: sorted,
  };
}

// ---------------------------------------------------------------------------
// Diff
// ---------------------------------------------------------------------------
function diffManifests(baseline, current) {
  const before = new Map(baseline.routes.map((r) => [keyOf(r), r]));
  const after = new Map(current.routes.map((r) => [keyOf(r), r]));

  const added = [...after.keys()].filter((k) => !before.has(k)).sort();
  const removed = [...before.keys()].filter((k) => !after.has(k)).sort();

  const changed = [];
  for (const [k, cur] of after) {
    const prev = before.get(k);
    if (!prev) continue;
    const fields = [];
    if (prev.auth !== cur.auth) fields.push(`auth: ${prev.auth} -> ${cur.auth}`);
    if (JSON.stringify(prev.rights) !== JSON.stringify(cur.rights))
      fields.push(`rights: ${JSON.stringify(prev.rights)} -> ${JSON.stringify(cur.rights)}`);
    if (prev.validated !== cur.validated)
      fields.push(`validated: ${prev.validated} -> ${cur.validated}`);
    if (JSON.stringify(prev.middleware) !== JSON.stringify(cur.middleware))
      fields.push('middleware chain changed');
    if (fields.length) changed.push({ route: k, fields });
  }

  return { added, removed, changed };
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------
function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    process.stdout.write(
      [
        'Usage: node tools/route-manifest.js [options]',
        '',
        '  --out <file>      write manifest to <file>',
        '  --diff <file>     compare against baseline <file>',
        '  --prefix <p>      API mount prefix (default /v1)',
        '  --quiet           suppress summary output',
        '',
      ].join('\n')
    );
    return 0;
  }

  const manifest = buildManifest(args.prefix);

  if (args.out) {
    const target = path.resolve(args.out);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
    if (!args.quiet) process.stdout.write(`written: ${args.out}\n`);
  }

  if (args.diff) {
    const baselinePath = path.resolve(args.diff);
    if (!fs.existsSync(baselinePath)) {
      process.stderr.write(`baseline not found: ${args.diff}\n`);
      return 1;
    }
    const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
    const result = diffManifests(baseline, manifest);

    if (!args.quiet) {
      process.stdout.write(
        [
          `baseline : ${baseline.routes.length} routes (${baseline.meta.generatedAt})`,
          `current  : ${manifest.routes.length} routes`,
          `added    : ${result.added.length}`,
          `removed  : ${result.removed.length}`,
          `changed  : ${result.changed.length}`,
          '',
        ].join('\n')
      );
      for (const r of result.added) process.stdout.write(`  + ${r}\n`);
      for (const r of result.removed) process.stdout.write(`  - ${r}\n`);
      for (const c of result.changed) {
        process.stdout.write(`  ~ ${c.route}\n`);
        for (const f of c.fields) process.stdout.write(`      ${f}\n`);
      }
    }

    const failed = result.added.length || result.removed.length || result.changed.length;
    if (!args.quiet) {
      process.stdout.write(failed ? '\nPARITY FAILED\n' : '\nPARITY OK\n');
    }
    return failed ? 2 : 0;
  }

  if (!args.quiet && !args.out) {
    process.stdout.write(`${JSON.stringify(manifest.meta, null, 2)}\n`);
  }

  return 0;
}

process.exit(main());
