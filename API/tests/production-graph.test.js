/**
 * Phase 2.16 guard: what a production boot actually loads.
 *
 * The Phase 2 exit criterion says "express removed from package.json". That
 * cannot be met yet, and this test exists to make the gap precise instead of
 * pretending otherwise - after Phase 2.15 nothing in the production *path*
 * needs Express, but `src/app.js` (with express, morgan and
 * express-rate-limit) is still loaded by the parity suites as the behavioural
 * baseline that proves the port, so those stay installed.
 *
 * Static analysis cannot answer the question: it cannot tell a lazy
 * `require()` inside a function from an eager one, and both of the loaders
 * below are lazy by design. So the assertion is made against a real boot - a
 * child process that runs the production entry's own bootstrap
 * (`buildFastify()`, the part before listen) and then reports its own
 * `require.cache`. Whatever is absent from that cache was never loaded, which
 * is stronger evidence than any grep.
 *
 * What is expected to be absent, and why each one is reachable only from the
 * Express baseline or lazily:
 *   express            - required lazily in src/routes/v1/index.js
 *   passport           - required lazily in src/middlewares/auth.factory.js
 *   morgan             - only src/config/morgan.js, reached from src/app.js
 *   express-rate-limit - only src/middlewares/rateLimiter.js, from app.js
 * What is deliberately still present: the two sanitizers (Phase 2.8 reuses
 * the exact same packages in Fastify's preValidation hooks, so behaviour
 * matches by construction) and express-es6-template-engine (Phase 2.13 renders
 * the HTML views with it on both servers).
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require_ = createRequire(import.meta.url);
const apiRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tsxCli = path.join(apiRoot, 'node_modules', 'tsx', 'dist', 'cli.mjs');
// Scratch artefacts (the probe itself and its output) live outside the repo so
// a test run never leaves untracked files behind.
const TMP_DIR = 'C:\\Users\\WEWORK~1\\AppData\\Local\\Temp\\opencode';
const OUT = path.join(TMP_DIR, 'production-graph.json');

/** Must not be in the cache after a production bootstrap. */
const MUST_BE_ABSENT = ['express', 'passport', 'passport-jwt', 'morgan', 'express-rate-limit', 'cookie-parser'];

/** Intentionally still loaded, with the step that made it production. */
const MUST_BE_PRESENT = {
  'express-es6-template-engine': '2.13 - renders the HTML views on both servers',
  'express-mongo-sanitize': '2.8 - reused in the Fastify preValidation hook',
  'express-xss-sanitizer': '2.8 - reused in the Fastify preValidation hook',
};

const CHILD = `
// This probe file is written into tools/, so the production entry is one level
// up - and it is required through the tsx runtime exactly as src/index.js does.
const { buildFastify } = require('../src/fastify');
buildFastify()
  .then((app) => app.close())
  .then(() => {
    const loaded = Object.keys(require.cache);
    const out = {};
    for (const spec of ${JSON.stringify([...MUST_BE_ABSENT, ...Object.keys(MUST_BE_PRESENT)])}) {
      const needle = 'node_modules' + require('node:path').sep + spec + require('node:path').sep;
      out[spec] = loaded.filter((f) => f.includes(needle)).length;
    }
    require('node:fs').writeFileSync(${JSON.stringify(OUT)}, JSON.stringify(out, null, 2));
  })
  .catch((err) => {
    require('node:fs').writeFileSync(${JSON.stringify(OUT)}, JSON.stringify({ error: String(err && err.stack) }));
    process.exit(1);
  });
`;

describe('Phase 2.16 - production boot loads no Express', () => {
  let loaded;

  beforeAll(async () => {
    fs.mkdirSync(TMP_DIR, { recursive: true });
    const childFile = path.join(TMP_DIR, 'production-graph.probe.cjs');
    const childEntry = path.join(TMP_DIR, 'production-graph.probe.entry.cjs');
    // Written into the temp dir, so '../src/fastify' is wrong there - the
    // production entry is loaded by absolute path instead, through the tsx
    // runtime exactly as src/index.js does.
    const CHILD_SRC = CHILD.replace(
      "require('../src/fastify')",
      `require(${JSON.stringify(path.join(apiRoot, 'src', 'fastify'))})`
    );
    fs.writeFileSync(childFile, CHILD_SRC, 'utf8');
    fs.writeFileSync(childEntry, `require(${JSON.stringify(childFile)});\n`, 'utf8');
    try {
      // process.execPath + tsx's cli, not the .bin shim: spawn() cannot run the
      // Windows .cmd without a shell (EINVAL). Same reasoning as
      // tests/entry.boot.test.js.
      await new Promise((resolve, reject) => {
        const child = spawn(process.execPath, [tsxCli, childEntry], {
          cwd: apiRoot,
          env: { ...process.env, NODE_ENV: 'test' },
          stdio: ['ignore', 'ignore', 'pipe'],
        });
        let err = '';
        child.stderr.on('data', (c) => {
          err += String(c);
        });
        child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`probe exited ${code}: ${err}`))));
      });
      loaded = JSON.parse(fs.readFileSync(OUT, 'utf8'));
      if (loaded.error) throw new Error(`probe failed: ${loaded.error}`);
    } finally {
      fs.rmSync(childFile, { force: true });
      fs.rmSync(childEntry, { force: true });
    }
  }, 120000);

  it.each(MUST_BE_ABSENT)('does not load %s', (pkg) => {
    expect(loaded[pkg], `${pkg} was loaded by a production bootstrap`).toBe(0);
  });

  it.each(Object.entries(MUST_BE_PRESENT))('still loads %s (%s)', (pkg) => {
    expect(loaded[pkg], `${pkg} should still be production-reachable`).toBeGreaterThan(0);
  });

  it('production never loads src/app.js', () => {
    // The Express app is the parity baseline; if it were reachable the whole
    // point of Phase 2.15 would be undone.
    const indexSrc = fs.readFileSync(path.join(apiRoot, 'src', 'index.js'), 'utf8');
    expect(indexSrc).not.toMatch(/require\(['"]\.\/app['"]\)/);
  });
});
