/**
 * Phase 0.4 contract tests: assert the JSON *shape* of every GET endpoint
 * that served 200 in the DB probe.
 *
 * Values are deliberately not snapshotted (ObjectIds, dates, counters), only
 * the structure: key set and value types per key. That is enough to catch the
 * failure mode that matters for the migration - a port changing or dropping a
 * field in a response the clients depend on.
 *
 * Re-record: UPDATE_CONTRACT=1 npx vitest run tests/contract.test.js
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { connectTestDb, disconnectTestDb } from './helpers/db.js';
import { seedUsers } from './helpers/seed.js';
import { hitRoute } from './helpers/http.js';

const apiRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(
  fs.readFileSync(path.join(apiRoot, 'tools', 'route-manifest.baseline.json'), 'utf8')
);
const probe = JSON.parse(fs.readFileSync(path.join(apiRoot, 'tools', 'http.db.probe.json'), 'utf8'));
const contractFile = path.join(apiRoot, 'tools', 'contract-baseline.json');

const app = (await import('../src/app')).default;

/** Recursive structural signature of a JSON value. */
export function shapeOf(value) {
  if (value === null) return 'null';
  if (Array.isArray(value)) return value.length ? [shapeOf(value[0])] : [];
  if (typeof value === 'object') {
    const out = {};
    for (const key of Object.keys(value).sort()) out[key] = shapeOf(value[key]);
    return out;
  }
  return typeof value;
}

function signatureFor(res) {
  if (res.body && typeof res.body === 'object' && Object.keys(res.body).length) {
    return { json: shapeOf(res.body) };
  }
  return { text: true, contentType: (res.contentType || '').split(';')[0] };
}

const routesByKey = new Map(manifest.routes.map((r) => [`GET ${r.path}`, r]));
const contractKeys = Object.entries(probe.results)
  .filter(([, r]) => r.status === 200)
  .map(([key]) => key);

describe('Contract: response shapes for GET endpoints that return 200', () => {
  let actual = {};

  beforeAll(async () => {
    await connectTestDb();
    await seedUsers();

    for (const key of contractKeys) {
      const route = routesByKey.get(key);
      const res = await hitRoute(app, route);
      actual[key] = { status: res.status, ...signatureFor(res) };
    }

    if (process.env.UPDATE_CONTRACT === '1' || !fs.existsSync(contractFile)) {
      fs.writeFileSync(
        contractFile,
        `${JSON.stringify(
          {
            meta: {
              generatedAt: new Date().toISOString(),
              total: contractKeys.length,
              source: 'tools/http.db.probe.json (status === 200)',
            },
            contracts: actual,
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

  it('covered every probe-200 endpoint', () => {
    expect(contractKeys.length).toBeGreaterThanOrEqual(580);
    expect(Object.keys(actual)).toHaveLength(contractKeys.length);
  });

  it('every contract endpoint still responds 200', () => {
    const bad = Object.entries(actual)
      .filter(([, r]) => r.status !== 200)
      .map(([k, r]) => `${k} -> ${r.status}`);
    expect(bad, `status regressions:\n${bad.join('\n')}`).toEqual([]);
  });

  it('response body shapes match the recorded baseline', () => {
    expect(fs.existsSync(contractFile), 'run UPDATE_CONTRACT=1 to record the baseline').toBe(true);
    const baseline = JSON.parse(fs.readFileSync(contractFile, 'utf8'));

    const diffs = [];
    for (const [key, expected] of Object.entries(baseline.contracts)) {
      const got = actual[key];
      if (!got) {
        diffs.push(`${key}: MISSING (endpoint no longer reachable)`);
        continue;
      }
      const a = JSON.stringify(got);
      const e = JSON.stringify(expected);
      if (a !== e) {
        diffs.push(`${key}\n  expected: ${e}\n  actual:   ${a}`);
      }
    }

    const extra = Object.keys(actual).filter((k) => !baseline.contracts[k]);
    for (const key of extra) {
      diffs.push(`${key}: NEW contract endpoint (re-record with UPDATE_CONTRACT=1)`);
    }

    expect(diffs, `${diffs.length} contract diff(s):\n\n${diffs.slice(0, 15).join('\n')}`).toEqual(
      []
    );
  });

  // ---- Named contracts for the endpoints every client boots on ----------
  // Kept human-readable on purpose: when a port drops one of these fields,
  // the failure should say so rather than point at a 580-entry diff.
  const get = (routePath, auth = null) => hitRoute(app, { path: routePath, auth, rights: [] });

  it('GET /v1/public/get_web_settings/ returns the fields the web + apps boot on', async () => {
    const res = await get('/v1/public/get_web_settings/');
    expect(res.status).toBe(200);
    expect(Object.keys(res.body).sort()).toEqual([
      'defaultLocale',
      'imagePath',
      'locales',
      'selfRegister',
      'settings',
      'user',
      'vendor',
    ]);
    expect(res.body.selfRegister).toEqual({ driver: expect.any(Boolean), vendor: expect.any(Boolean) });
    expect(Array.isArray(res.body.locales)).toBe(true);
  });

  it('GET /v1/public/getDriverSettings returns versions + social auth config', async () => {
    const res = await get('/v1/public/getDriverSettings');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      versions: { androidVersion: expect.any(String), iosVersion: expect.any(String) },
      social: {
        googleSignin: expect.any(Boolean),
        facebookSignin: expect.any(Boolean),
        googleOAuth: expect.anything(),
      },
      settings: null,
      driver: null,
    });
  });

  it('GET /v1/public/getVendorSettings returns business + vendor config', async () => {
    const res = await get('/v1/public/getVendorSettings');
    expect(res.status).toBe(200);
    expect(Object.keys(res.body).sort()).toEqual([
      'business',
      'imagePath',
      'language',
      'social',
      'vendor',
      'versions',
    ]);
  });

  it('GET /v1/auth/installations reports whether seeding has run', async () => {
    const res = await get('/v1/auth/installations');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ isDone: expect.any(Boolean) });
  });

  it('GET /v1/admin/dashboard returns the counters the admin home renders', async () => {
    const res = await get('/v1/admin/dashboard', 'jwt-web');
    expect(res.status).toBe(200);
    expect(Object.keys(res.body.count).sort()).toEqual([
      'accepted',
      'cancelled',
      'delivered',
      'fresh',
      'handover',
      'ongoing',
      'partially',
      'pending',
      'preparing',
      'ready',
      'refunded',
      'rejected',
    ]);
    expect(Object.keys(res.body.roles)).toContain('totalUsers');
    expect(res.body.success).toBe(true);
  });

  it('GET /v1/public/register/getBasicDataRestaurantRequest returns the vendor signup form', async () => {
    const res = await get('/v1/public/register/getBasicDataRestaurantRequest');
    expect(res.status).toBe(200);
    expect(Object.keys(res.body).sort()).toEqual([
      'cities',
      'joiningForm',
      'licenses',
      'payment',
      'settings',
      'subscriptionPackages',
      'success',
    ]);
    expect(res.body.success).toBe(true);
  });
});
