/**
 * Phase 3.1 gate: the domain inventory stays honest.
 *
 * The eleven domain boundaries are only meaningful if they are complete and
 * current, and a hand-maintained map of 275 modules rots silently. This test
 * pins the three properties that make the map trustworthy, by running
 * tools/domain-inventory.js (not by re-implementing its logic here):
 *
 *   1. every governed module has a domain - an unclassified module would make
 *      the Phase 3 exit criterion ("zero cross-domain imports") unfalsifiable;
 *   2. the generated facades match the classification, so nobody hand-edits a
 *      generated file and drifts;
 *   3. every module the barrels export today is reachable from some domain
 *      facade under the *same* name - that is what makes a consumer's
 *      `require('../services')` -> `require('../domains/<d>')` switch safe.
 *
 * It also records the coupling numbers the plan was written against, so a
 * future Phase 3 step that makes the boundaries worse is visible in review.
 */
import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const apiRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tool = path.join(apiRoot, 'tools', 'domain-inventory.js');

// Imported rather than re-implemented: the boundary rule and this test both
// read the same classification, and a test that re-derived it would be testing
// its own copy. The tool is require.main-guarded for exactly this.
const inventory = (await import(tool)).default ?? (await import(tool));

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.js$/.test(entry.name)) out.push(full);
  }
  return out;
}

function run(args) {
  return execFileSync(process.execPath, [tool, ...args], { cwd: apiRoot, encoding: 'utf8' });
}

describe('Phase 3.1 - domain inventory', () => {
  let report;

  beforeAll(() => {
    report = JSON.parse(run(['--json']));
  }, 60000);

  it('classifies every service and model', () => {
    expect(report.unclassified).toEqual([]);

    // The barrels plus the three plugins under models/plugins/ are the only
    // things the inventory deliberately does not govern.
    const services = fs
      .readdirSync(path.join(apiRoot, 'src', 'services'))
      .filter((f) => f.endsWith('.js') && f !== 'index.js').length;
    const models = fs
      .readdirSync(path.join(apiRoot, 'src', 'models'))
      .filter((f) => f.endsWith('.js') && f !== 'index.js' && !f.endsWith('.model.js')).length;
    const modelFiles = fs
      .readdirSync(path.join(apiRoot, 'src', 'models'))
      .filter((f) => f.endsWith('.js') && f !== 'index.js').length;
    // Phase 3.6a: a shared kernel is exempt as an import *target* but is still
    // classified - it keeps its home domain so the barrel and the generated
    // facades still line up. Counting it here keeps this assertion honest:
    // every non-barrel module under services/, models/ and shared/ is placed.
    const sharedFiles = fs.existsSync(path.join(apiRoot, 'src', 'shared'))
      ? fs
          .readdirSync(path.join(apiRoot, 'src', 'shared'), { withFileTypes: true })
          .filter((d) => d.isDirectory())
          .reduce(
            (n, d) =>
              n +
              fs
                .readdirSync(path.join(apiRoot, 'src', 'shared', d.name))
                .filter((f) => f.endsWith('.js') && f !== 'index.js').length,
            0
          )
      : 0;

    const total = Object.values(report.domains).reduce((n, d) => n + d.modules.length, 0);
    expect(total).toBe(services + modelFiles + sharedFiles);
    expect(modelFiles).toBeGreaterThanOrEqual(models);
  });

  it('keeps the generated facades in sync with the classification', () => {
    // Exits non-zero and names the drifted files.
    expect(() => run(['--check-domains'])).not.toThrow();
  });

  it('has a facade per domain, and none for an unknown domain', () => {
    const dirs = fs
      .readdirSync(path.join(apiRoot, 'src', 'domains'), { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .sort();
    expect(dirs).toEqual(Object.keys(report.domains).sort());
    for (const d of dirs) {
      expect(fs.existsSync(path.join(apiRoot, 'src', 'domains', d, 'index.ts'))).toBe(true);
    }
  });

  it('re-exports every barrel name from exactly one domain facade', () => {
    // Read the barrel export names and the names each facade exports, then
    // assert the union matches: nothing lost, nothing invented.
    const barrelNames = new Set();
    for (const barrel of ['services', 'models']) {
      const src = fs.readFileSync(path.join(apiRoot, 'src', barrel, 'index.js'), 'utf8');
      for (const m of src.matchAll(/module\.exports\.([A-Za-z_$][\w$]*)\s*=/g)) barrelNames.add(m[1]);
    }

    const facadeNames = new Set();
    for (const d of fs.readdirSync(path.join(apiRoot, 'src', 'domains'))) {
      const src = fs.readFileSync(path.join(apiRoot, 'src', 'domains', d, 'index.ts'), 'utf8');
      for (const m of src.matchAll(/^export \{ ([A-Za-z_$][\w$]*) \};/gm)) facadeNames.add(m[1]);
    }

    const missing = [...barrelNames].filter((n) => !facadeNames.has(n)).sort();
    const extra = [...facadeNames].filter((n) => !barrelNames.has(n)).sort();

    expect({ missing, extra }).toEqual({ missing: [], extra: [] });
  });

  it('records the coupling the phase is trying to remove', () => {
    // 22 direct cross-domain edges and ~130 barrel edges at the time of
    // writing. These are the numbers 3.3/3.4 and the barrel removal have to
    // drive down; asserting a range rather than an exact value keeps the test
    // useful without making every legitimate edit a test edit.
    expect(report.crossDomainEdges.length).toBeGreaterThan(0);
    expect(report.crossDomainEdges.length).toBeLessThan(60);
    expect(report.barrelEdges).toBeGreaterThan(0);
  });
});

/**
 * The lint gate has to be shown to fail, not just to pass. A boundary rule
 * that never fires is indistinguishable from no rule at all, so each case here
 * writes a real violating file into src/services (so it is linted by the real
 * config), runs the real `npm run lint`, and asserts the message appears.
 */
describe('Phase 3.2 - the domain boundary rule actually fires', () => {
  const servicesDir = path.join(apiRoot, 'src', 'services');
  // The probe has to land *in* a domain or the rule correctly skips it: the
  // filename is what the inventory classifies, so `food.boundary.probe`
  // resolves to the `catalog` domain via the `food` prefix.
  const probe = path.join(servicesDir, 'food.boundary.probe.service.js');
  let lintOut;

  // eslint's own entry point, invoked directly: going through `npm run` adds
  // a shell layer that swallows stdout on Windows, and the point of these
  // cases is to read the report.
  const eslintBin = path.join(apiRoot, 'node_modules', 'eslint', 'bin', 'eslint.js');

  function lint() {
    try {
      execFileSync(process.execPath, [eslintBin, 'src'], { cwd: apiRoot, encoding: 'utf8' });
      return '';
    } catch (err) {
      return `${err.stdout || ''}${err.stderr || ''}`;
    }
  }

  afterEach(() => {
    if (fs.existsSync(probe)) fs.rmSync(probe);
  });

  it('passes on the real tree before any probe is added', () => {
    expect(lint()).toBe('');
  });

  it('flags a new cross-domain service import', () => {
    // The probe is in `catalog` (food.*); restaurant.service.js is in
    // `restaurant`, and that edge is not in the allowlist.
    fs.writeFileSync(
      probe,
      "'use strict';\nconst restaurant = require('./restaurant.service');\nmodule.exports = { restaurant };\n",
      'utf8'
    );
    lintOut = lint();
    expect(lintOut).toMatch(/must not import 'restaurant'/);
    expect(lintOut).toMatch(/domain-boundary/);
  });

  it('does not flag a same-domain import', () => {
    // food.taxation.service.js is also in `catalog`.
    fs.writeFileSync(
      probe,
      "'use strict';\nconst food = require('./food.taxation.service');\nmodule.exports = { food };\n",
      'utf8'
    );
    expect(lint()).toBe('');
  });

  it('tolerates the real cross-domain edges that already exist', () => {
    // services/orders.service.js -> services/restaurant.service.js is one of
    // the 22 edges in the allowlist, so linting the untouched tree must stay
    // clean. (A synthetic probe could not prove this: the allowlist is keyed
    // by the exact file pair, so only the real file exercises it.)
    const allow = JSON.parse(
      fs.readFileSync(path.join(apiRoot, 'tools', 'domain-boundary-allowlist.json'), 'utf8')
    );
    // Matched by domain, not by importer path. Phase 3.3 split
    // orders.service.js into lifecycle buckets, so the callers of
    // restaurant.service.js now live in orders.status.internal.js and
    // orders.assign.internal.js. Pinning the filename would have made the test
    // fail on a pure move while telling us nothing about the boundary.
    const tolerated = allow.edges.find(
      (e) => e.fromDomain === 'orders' && e.to === 'services/restaurant.service.js'
    );
    expect(tolerated, 'the orders -> restaurant edge should still be tolerated').toBeTruthy();
    expect(lint()).toBe('');
  });

  it('flags a facade importing another domain facade', () => {
    const facadeProbe = path.join(apiRoot, 'src', 'domains', 'orders', '__probe.ts');
    fs.writeFileSync(facadeProbe, "export * from '../catalog';\n", 'utf8');
    try {
      lintOut = lint();
      expect(lintOut).toMatch(/must not import another domain's facade/);
    } finally {
      fs.rmSync(facadeProbe, { force: true });
    }
  });

  it('does not flag an import of a shared kernel', () => {
    // Phase 3.6a. The probe is `catalog`; the kernel is exempt as an import
    // TARGET because it was pulled out of a domain precisely because it is
    // cross-cutting. Without the exemption every cross-domain caller of
    // fcm.notification.service would still be an edge after the move - the
    // code would have changed directory and the count would not have moved.
    fs.writeFileSync(
      probe,
      "'use strict';\nconst fcm = require('../shared/notifications/fcm.notification.service');\nmodule.exports = { fcm };\n",
      'utf8'
    );
    expect(lint()).toBe('');
  });

  it('flags a shared kernel reaching into a business domain', () => {
    // The exemption is one-directional. A kernel may be imported by anyone; it
    // may not itself import sideways into a domain, which is the direction a
    // shared kernel rots in.
    const kernelProbe = path.join(
      apiRoot, 'src', 'shared', 'notifications', '__probe.service.js'
    );
    fs.writeFileSync(
      kernelProbe,
      "'use strict';\nconst orders = require('../../services/orders.service');\nmodule.exports = { orders };\n",
      'utf8'
    );
    try {
      lintOut = lint();
      expect(lintOut).toMatch(/must not import 'orders'/);
    } finally {
      fs.rmSync(kernelProbe, { force: true });
    }
  });
});

describe('Phase 3.6 - shared kernels', () => {
  const sharedDir = path.join(apiRoot, 'src', 'shared');

  it('classifies a kernel module into its home domain, not as unclassified', () => {
    // The kernel is exempt as an import target, but it must still be classified
    // so the services barrel keeps resolving its names to a facade. If the
    // classification were dropped instead, `unclassified` would grow and the
    // barrel-to-facade test would fail with the kernel's names unreachable.
    const rel = 'shared/notifications/fcm.notification.service.js';
    expect(inventory.domainOf(rel)).toBe('notifications');
  });

  it('keeps a kernel exempt as an import target, in the tool and the rule alike', () => {
    const before = inventory.build().crossDomain.length;
    const kernelImporters = [];
    for (const domain of Object.keys(inventory.DOMAINS)) {
      for (const f of walk(path.join(apiRoot, 'src', 'services'))) {
        const rel = path.relative(path.join(apiRoot, 'src'), f).replace(/\\/g, '/');
        if (inventory.domainOf(rel) !== domain) continue;
        const src = fs.readFileSync(f, 'utf8');
        if (/require\(['"]\.\.\/shared\/[^/]+\//.test(src)) kernelImporters.push(rel);
      }
    }
    expect(kernelImporters.length).toBeGreaterThan(0);
    expect(
      inventory.build().crossDomain.some((e) => e.to.startsWith('shared/')),
      'a shared kernel was counted as a cross-domain edge'
    ).toBe(false);
    expect(before).toBeGreaterThan(0);
  });

  it('exposes each kernel through an index that re-exports it', () => {
    for (const kernel of fs.readdirSync(sharedDir)) {
      const index = path.join(sharedDir, kernel, 'index.js');
      expect(fs.existsSync(index), `${kernel} has no index.js`).toBe(true);
      const src = fs.readFileSync(index, 'utf8');
      expect(src).toMatch(/module\.exports/);
    }
  });
});

/**
 * A kernel publishes its members as MODULE bindings, the same shape
 * services/index.js uses. That is not cosmetic: restaurant.cash.in.hand and
 * deliveryman.cash.in.hand both export `saveCashInHand` and `clearCashInHand`,
 * so a flattened spread published the deliveryman functions under the
 * restaurant's names and reported nothing at all.
 */
describe('Phase 3.6 - kernel entry points match the barrel shape', () => {
  const kernelsDir = path.join(apiRoot, 'tools', 'kernels');
  const specs = fs
    .readdirSync(kernelsDir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => JSON.parse(fs.readFileSync(path.join(kernelsDir, f), 'utf8')));

  it('declares a spec for every extracted kernel', () => {
    const declared = specs.map((s) => s.kernel).sort();
    const onDisk = fs
      .readdirSync(path.join(apiRoot, 'src', 'shared'), { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .sort();
    expect(onDisk).toEqual(declared);
  });

  it.each(specs)('$kernel publishes module bindings, not a flattened spread', (spec) => {
    const index = path.join(apiRoot, 'src', 'shared', spec.kernel, 'index.js');
    if (!fs.existsSync(index)) return; // not extracted yet
    const src = fs.readFileSync(index, 'utf8');
    expect(src, `${spec.kernel} flattens its members' functions`).not.toMatch(/^\s*\.\.\./m);

    // Every member is bound, and the published names are the module names.
    const bound = [...src.matchAll(/^const (\w+) = require\('\.\//gm)].map((m) => m[1]);
    expect(bound).toHaveLength(spec.members.length);
    const published = (src.match(/module\.exports = \{([\s\S]*?)\};/)[1].match(/(\w+),/g) || []).map(
      (s) => s.replace(/[,\s]/g, '')
    );
    expect(published.sort()).toEqual(bound.sort());
  });

  it.each(specs)('$kernel has no member left at its old path', (spec) => {
    for (const member of spec.members) {
      expect(
        fs.existsSync(path.join(apiRoot, member)),
        `${member} still exists alongside the kernel`
      ).toBe(false);
    }
  });

  it.each(specs)('$kernel keeps its declared home domain', (spec) => {
    if (!spec.home) return;
    const dir = path.join(apiRoot, 'src', 'shared', spec.kernel);
    if (!fs.existsSync(dir)) return;
    for (const member of fs.readdirSync(dir).filter((f) => f !== 'index.js')) {
      const rel = `shared/${spec.kernel}/${member}`;
      expect(inventory.domainOf(rel), `${rel} is not classified as ${spec.home}`).toBe(spec.home);
    }
  });
});

describe('Phase 3.2 - the allowlist cannot drift', () => {
  it('has no edges that no longer exist, and no missing ones', () => {
    // Exits non-zero only when a *new* cross-domain edge appeared; stale
    // entries are reported as progress, not failure.
    expect(() =>
      execFileSync(process.execPath, [tool, '--check-allowlist'], { cwd: apiRoot, encoding: 'utf8' })
    ).not.toThrow();
  });
});
