import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const apiRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const baselinePath = path.join(apiRoot, 'tools', 'route-manifest.baseline.json');

function runManifest(args) {
  return execFileSync(process.execPath, ['tools/route-manifest.js', ...args], {
    cwd: apiRoot,
    encoding: 'utf8',
  });
}

describe('route manifest', () => {
  it('diffs clean against the Phase 0 baseline', () => {
    const output = runManifest(['--diff', 'tools/route-manifest.baseline.json']);

    expect(output).toContain('added    : 0');
    expect(output).toContain('removed  : 0');
    expect(output).toContain('changed  : 0');
    expect(output).toContain('PARITY OK');
  }, 60000);

  it('reports the expected endpoint count and auth breakdown', () => {
    const tmp = path.join(os.tmpdir(), `route-manifest-${process.pid}.json`);
    try {
      runManifest(['--out', tmp, '--quiet']);
      const manifest = JSON.parse(fs.readFileSync(tmp, 'utf8'));

      expect(manifest.meta.totalRoutes).toBe(1926);
      expect(manifest.meta.methodBreakdown).toEqual({
        GET: 1018,
        POST: 546,
        PATCH: 258,
        DELETE: 104,
      });
      expect(manifest.meta.authBreakdown).toEqual({
        'jwt-web': 1348,
        'jwt-app': 419,
        public: 159,
      });
      // Known defect: duplicated route that will abort Fastify boot in Phase 2.
      expect(manifest.meta.duplicates).toEqual(['GET /v1/cityzen/search_customer/:name']);
    } finally {
      fs.rmSync(tmp, { force: true });
    }
  }, 60000);

  it('baseline on disk is in sync with the committed source', () => {
    const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
    expect(baseline.meta.totalRoutes).toBe(1926);
    expect(baseline.routes).toHaveLength(1926);
  });
});
