/**
 * HTTP smoke suite over every registered endpoint.
 *
 * Purpose: prove that all 1,926 routes are still mounted, still gated by
 * the right auth strategy, and still produce the same status codes as the
 * Phase 0 baseline - without needing a MongoDB connection.
 *
 * Why this works offline:
 *   - passport-jwt rejects a missing token before its verify callback runs,
 *     so the ~1,767 protected routes answer 401 without touching the DB.
 *   - mongoose buffering is disabled in tests/setup.js, so the public routes
 *     that do query fail immediately instead of hanging for 10s.
 *   - the boot-time cron scheduler is stubbed in tests/setup.js, so requiring
 *     src/app.js performs no deleteMany()/save().
 *
 * Re-record after an intentional behaviour change:
 *   UPDATE_SMOKE_BASELINE=1 npm test
 */
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const apiRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const baselineFile = path.join(apiRoot, 'tools', 'http-smoke.baseline.json');
const manifest = JSON.parse(
  fs.readFileSync(path.join(apiRoot, 'tools', 'route-manifest.baseline.json'), 'utf8')
);

const app = (await import('../src/app')).default;

const RESPONSE_TIMEOUT_MS = 10000;

/** Replace `:param` segments with a harmless literal. */
function concretePath(p) {
  return p.replace(/:([^/]+)/g, 'smoke-param');
}

function keyOf(route) {
  return `${route.method} ${route.path}`;
}

/**
 * Keys are `METHOD /path`. The manifest had one duplicate until Phase 2.1
 * removed it; the Set stays as a guard against a duplicate ever coming back,
 * because Fastify refuses to boot on one.
 */
const uniqueKeys = new Set(manifest.routes.map(keyOf));

async function hit(route) {
  const res = request(app)[route.method.toLowerCase()](concretePath(route.path));
  try {
    const response = await res.timeout({ response: RESPONSE_TIMEOUT_MS });
    return response.status;
  } catch (err) {
    if (err?.response) return err.response.status;
    return `ERROR:${err?.code || err?.message || 'unknown'}`;
  }
}

describe('HTTP smoke: all registered endpoints', () => {
  let results;
  let baseline = null;
  const shouldUpdate = process.env.UPDATE_SMOKE_BASELINE === '1';

  beforeAll(async () => {
    if (!shouldUpdate && fs.existsSync(baselineFile)) {
      baseline = JSON.parse(fs.readFileSync(baselineFile, 'utf8'));
    }

    results = {};
    for (const route of manifest.routes) {
      results[keyOf(route)] = await hit(route);
    }

    if (shouldUpdate || !baseline) {
      fs.writeFileSync(
        baselineFile,
        `${JSON.stringify(
          {
            meta: {
              generatedAt: new Date().toISOString(),
              total: uniqueKeys.size,
              note: 'status code per endpoint, captured offline (no DB)',
            },
            statuses: results,
          },
          null,
          2
        )}\n`,
        'utf8'
      );
      baseline = null;
    }
  }, 300000);

  it('exercises every route in the manifest', () => {
    // 1,925 declared routes and 1,925 distinct - the duplicate
    // `GET /v1/cityzen/search_customer/:name` was removed in Phase 2.1.
    expect(manifest.routes).toHaveLength(1925);
    expect(Object.keys(results)).toHaveLength(uniqueKeys.size);
    expect(uniqueKeys.size).toBe(1925);
  });

  it('never returns 404 - no route has gone missing', () => {
    const missing = Object.entries(results)
      .filter(([, status]) => status === 404)
      .map(([k]) => k);

    expect(missing, `routes no longer mounted:\n${missing.join('\n')}`).toEqual([]);
  });

  it('keeps every protected route behind auth (401) or validation (400/422)', () => {
    const bad = [];
    for (const route of manifest.routes) {
      if (!route.auth) continue;
      const status = results[keyOf(route)];
      if (![400, 401, 403, 422].includes(status)) {
        bad.push(`${keyOf(route)} -> ${status} (expected 401, auth: ${route.auth})`);
      }
    }

    expect(bad, `protected routes leaking through:\n${bad.join('\n')}`).toEqual([]);
  });

  it('matches the recorded status baseline', () => {
    if (!baseline) {
      // First run (or UPDATE_SMOKE_BASELINE=1) - baseline was just recorded.
      expect(Object.keys(results).length).toBe(uniqueKeys.size);
      return;
    }

    const diffs = [];
    for (const [key, status] of Object.entries(results)) {
      const expected = baseline.statuses[key];
      if (expected === undefined) diffs.push(`${key}: not in baseline (got ${status})`);
      else if (expected !== status) diffs.push(`${key}: baseline ${expected} -> now ${status}`);
    }
    for (const key of Object.keys(baseline.statuses)) {
      if (!(key in results)) diffs.push(`${key}: missing from current run`);
    }

    expect(diffs, `status drift:\n${diffs.slice(0, 50).join('\n')}`).toEqual([]);
  });

  it('returns responses quickly (no request exceeded the timeout)', () => {
    const slow = Object.entries(results)
      .filter(([, status]) => typeof status === 'string' && status.startsWith('ERROR:'))
      .map(([k, s]) => `${k} -> ${s}`);

    expect(slow, `request failures:\n${slow.join('\n')}`).toEqual([]);
  });
});
