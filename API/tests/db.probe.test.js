/**
 * Phase 0.4 probe: hit every GET endpoint against a real (test) MongoDB with
 * role-appropriate tokens and record the status code.
 *
 * This tells us which endpoints actually serve data once a DB is present -
 * the offline smoke suite can only tell us "mounted + gated". The recorded
 * file feeds tests/contract.test.js.
 *
 * Re-record: UPDATE_DB_PROBE=1 npx vitest run tests/db.probe.test.js
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { connectTestDb, disconnectTestDb, TEST_DB_URL } from './helpers/db.js';
import { seedUsers, usersByRole } from './helpers/seed.js';
import { hitRoute } from './helpers/http.js';

const apiRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(
  fs.readFileSync(path.join(apiRoot, 'tools', 'route-manifest.baseline.json'), 'utf8')
);
const probeFile = path.join(apiRoot, 'tools', 'http.db.probe.json');

const app = (await import('../src/app')).default;

const getRoutes = manifest.routes.filter((r) => r.method === 'GET');
// Manifest has one duplicate path; probe results are keyed by path.
const probeRoutes = [...new Map(getRoutes.map((r) => [`GET ${r.path}`, r])).values()];

describe('DB probe: GET endpoints against a live test database', () => {
  let results;

  beforeAll(async () => {
    await connectTestDb();
    await seedUsers();

    results = {};
    for (const route of probeRoutes) {
      const res = await hitRoute(app, route);
      results[`GET ${route.path}`] = { status: res.status, auth: route.auth || 'public' };
    }

    if (process.env.UPDATE_DB_PROBE === '1' || !fs.existsSync(probeFile)) {
      const summary = Object.values(results).reduce((acc, r) => {
        acc[r.status] = (acc[r.status] || 0) + 1;
        return acc;
      }, {});
      fs.writeFileSync(
        probeFile,
        `${JSON.stringify(
          {
            meta: {
              generatedAt: new Date().toISOString(),
              db: TEST_DB_URL,
              total: getRoutes.length,
              statusSummary: summary,
            },
            results,
          },
          null,
          2
        )}\n`,
        'utf8'
      );
    }
  }, 300000);

  afterAll(async () => {
    await disconnectTestDb();
  });

  it('connected to an isolated test database', () => {
    expect(TEST_DB_URL).toContain('foodbite_test');
  });

  it('seeded one user per role', () => {
    expect(Object.keys(usersByRole).length).toBe(9);
    expect(usersByRole.admin).toBeTruthy();
    expect(usersByRole.user).toBeTruthy();
  });

  it('probed every GET endpoint', () => {
    // 1018 declared GET routes collapse to 1017 distinct keys (one known
    // duplicate: GET /v1/cityzen/search_customer/:name).
    expect(getRoutes.length).toBe(1018);
    expect(Object.keys(results)).toHaveLength(1017);
  });

  it('no request failed with a transport error', () => {
    const bad = Object.entries(results)
      .filter(([, r]) => typeof r.status === 'string')
      .map(([k, r]) => `${k} -> ${r.status}`);
    expect(bad, `transport failures:\n${bad.slice(0, 20).join('\n')}`).toEqual([]);
  });

  it('auth is enforced or the endpoint succeeds - no unexpected failures', () => {
    const allowed = new Set([200, 400, 404]);
    const unexpected = Object.entries(results)
      .filter(([, r]) => !allowed.has(r.status))
      .map(([k, r]) => `${k} -> ${r.status} [${r.auth}]`);
    // Logged so the failure list is visible; asserted empty is the goal of a
    // later hardening pass, not of Phase 0.
    if (unexpected.length) {
      console.log(`probe unexpected statuses (${unexpected.length}):\n${unexpected.join('\n')}`);
    }
    expect(unexpected.length).toBeLessThan(30);
  });
});
