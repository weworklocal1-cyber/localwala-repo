/**
 * Phase 2.7 parity gate: `express-rate-limit` vs `@fastify/rate-limit`.
 *
 * Both servers are forced into production mode, because that is the only
 * environment where `src/app.js` mounts the limiter at all:
 *
 *     if (config.env === 'production') {
 *       app.set('trust proxy', [...]);
 *       app.use('/v1/auth', authLimiter);
 *     }
 *
 * `authLimiter` is 20 requests / 15 minutes / `skipSuccessfulRequests: true`,
 * and it is the only rate limiter in the codebase. Three behaviours are
 * pinned, in this order because they share one counter window:
 *
 *   1. routes outside `/v1/auth` carry no rate-limit headers at all
 *   2. successful requests never consume budget (the Express-only option
 *      @fastify/rate-limit does not have - see src/plugins/authRateLimit.ts)
 *   3. the 21st failed request is a 429 on both, with the same body,
 *      content type, and headers
 *
 * Phase 2 leaves the counter at zero, so phase 3 starts from a clean window
 * without needing a reset that Express does not expose.
 *
 * This file needs no MongoDB: the two routes under test are synthetic and the
 * real app boots offline (mongoose buffering is disabled in tests/setup.js).
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createRequire } from 'node:module';

const require_ = createRequire(import.meta.url);
const config = require_('../src/config/config');
const morgan = require_('../src/config/morgan');

const originalEnv = config.env;

// morgan logs every request through winston; stub both handlers before app.js
// loads so 60-odd probe requests do not flood the run output. Same
// require-cache patching technique as tests/setup.js, for the same reason:
// vi.mock cannot intercept CommonJS.
morgan.successHandler = (_req, _res, next) => next();
morgan.errorHandler = (_req, _res, next) => next();

// Force the production branch in app.js (limiter + trust proxy) *before* it is
// imported, and in buildFastify() which reads config.env when called.
config.env = 'production';

const expressApp = (await import('../src/app')).default;
const { buildFastify } = await import('../src/fastify');

const RATE_HEADERS = [
  'x-ratelimit-limit',
  'x-ratelimit-remaining',
  'x-ratelimit-reset',
  'retry-after',
];
const LIMIT = 20;
const WINDOW_SECONDS = 15 * 60;
const MESSAGE = 'Too many requests, please try again later.';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

describe('Phase 2.7 - express-rate-limit vs @fastify/rate-limit', () => {
  let fastify;

  beforeAll(async () => {
    // app.js ends with a catch-all `app.use((req,res,next) => next(new ApiError(404,...)))`
    // before errorConverter/errorHandler, so routes appended from outside are
    // unreachable. Re-order the router stack to put the probes where they would
    // sit if they had been declared in app.js: right before that catch-all.
    // Verified by the stack dump in the plan notes - the tail is always
    // [404 (3 args), errorConverter (4), errorHandler (4)].
    const stack = expressApp.router.stack;
    const insertAt = stack.length - 3;
    const appendedAt = stack.length;
    expressApp.get('/v1/auth/__parity_ok', (_req, res) => res.status(200).json({ ok: true }));
    expressApp.get('/v1/auth/__parity_fail', (_req, res) => res.status(401).json({ ok: false }));
    stack.splice(insertAt, 0, ...stack.splice(appendedAt));

    fastify = await buildFastify();
    fastify.get('/v1/auth/__parity_ok', async () => ({ ok: true }));
    fastify.get('/v1/auth/__parity_fail', async (_request, reply) =>
      reply.code(401).send({ ok: false })
    );
    await fastify.ready();
  }, 60000);

  afterAll(async () => {
    if (fastify) await fastify.close();
    config.env = originalEnv;
  });

  async function hitBoth(url) {
    // Same trick as tests/fastify.parity.test.js:115 - supertest always sends
    // `accept-encoding`, fastify.inject never does. Without it @fastify/compress
    // declines to transform and therefore omits `Vary: Accept-Encoding`, while
    // Express's compression middleware emits it regardless of the request.
    const headers = { 'accept-encoding': 'gzip, deflate' };
    const [fRes, eRes] = await Promise.all([
      fastify.inject({ method: 'GET', url, headers }),
      request(expressApp).get(url).set(headers),
    ]);
    return { fRes, eRes };
  }

  it('adds no rate-limit headers outside /v1/auth', async () => {
    const { fRes, eRes } = await hitBoth('/');

    expect(fRes.statusCode).toBe(200);
    expect(eRes.status).toBe(200);
    for (const header of RATE_HEADERS) {
      expect(fRes.headers[header], `fastify set ${header}`).toBeUndefined();
      expect(eRes.headers[header], `express set ${header}`).toBeUndefined();
    }
  });

  it('never throttles successful requests (skipSuccessfulRequests)', async () => {
    // More than `LIMIT` requests: without the decrement the 21st would be 429.
    for (let attempt = 1; attempt <= LIMIT + 10; attempt += 1) {
      const { fRes, eRes } = await hitBoth('/v1/auth/__parity_ok');

      expect(fRes.statusCode, `fastify on attempt ${attempt}`).toBe(200);
      expect(eRes.status, `express on attempt ${attempt}`).toBe(200);

      expect(fRes.headers['x-ratelimit-limit']).toBe(String(LIMIT));
      expect(eRes.headers['x-ratelimit-limit']).toBe(String(LIMIT));

      // Both must still report a full budget minus this request, i.e. the
      // previous successful request was actually refunded.
      expect(fRes.headers['x-ratelimit-remaining'], `fastify attempt ${attempt}`).toBe('19');
      expect(eRes.headers['x-ratelimit-remaining'], `express attempt ${attempt}`).toBe('19');

      // Let onResponse / res 'finish' refund the counter before the next hit.
      await sleep(10);
    }
  });

  it('throttles the 21st failed request identically', async () => {
    let throttled;

    for (let attempt = 1; attempt <= LIMIT + 1; attempt += 1) {
      const result = await hitBoth('/v1/auth/__parity_fail');

      if (attempt <= LIMIT) {
        expect(result.fRes.statusCode, `fastify on attempt ${attempt}`).toBe(401);
        expect(result.eRes.status, `express on attempt ${attempt}`).toBe(401);
      } else {
        throttled = result;
      }
      await sleep(10);
    }

    const { fRes, eRes } = throttled;
    expect(fRes.statusCode).toBe(429);
    expect(eRes.status).toBe(429);

    // Body: express-rate-limit's default message as bare text, not JSON.
    expect(String(fRes.body)).toBe(MESSAGE);
    expect(eRes.text).toBe(MESSAGE);
    expect(fRes.headers['content-type']).toBe('text/html; charset=utf-8');
    expect(eRes.headers['content-type']).toBe('text/html; charset=utf-8');
    expect(fRes.headers['content-length']).toBe(eRes.headers['content-length']);

    expect(fRes.headers['x-ratelimit-limit']).toBe(String(LIMIT));
    expect(eRes.headers['x-ratelimit-limit']).toBe(String(LIMIT));
    expect(fRes.headers['x-ratelimit-remaining']).toBe('0');
    expect(eRes.headers['x-ratelimit-remaining']).toBe('0');

    // X-RateLimit-Reset is an absolute epoch second on both, and Retry-After
    // is the remaining seconds. The two servers started their windows a few
    // milliseconds apart, so allow one second of slack - never more.
    const nowSeconds = Math.ceil(Date.now() / 1000);
    for (const header of ['x-ratelimit-reset', 'retry-after']) {
      const fromFastify = Number(fRes.headers[header]);
      const fromExpress = Number(eRes.headers[header]);
      expect(Number.isFinite(fromFastify), `fastify ${header}`).toBe(true);
      expect(Number.isFinite(fromExpress), `express ${header}`).toBe(true);
      expect(Math.abs(fromFastify - fromExpress), `${header} drift`).toBeLessThanOrEqual(1);
    }

    const reset = Number(fRes.headers['x-ratelimit-reset']);
    expect(reset).toBeGreaterThanOrEqual(nowSeconds + WINDOW_SECONDS - 5);
    expect(reset).toBeLessThanOrEqual(nowSeconds + WINDOW_SECONDS + 2);
    // Express computes Retry-After from the same reset instant.
    expect(Number(fRes.headers['retry-after'])).toBeLessThanOrEqual(WINDOW_SECONDS);
    expect(Number(fRes.headers['retry-after'])).toBeGreaterThan(WINDOW_SECONDS - 120);

    // Same ETag over the same bytes, same Vary, same Date-less parity.
    expect(fRes.headers.etag).toBe(eRes.headers.etag);
    expect(fRes.headers.vary).toBe(eRes.headers.vary);
  });

  it('still answers 429 for every further failed attempt in the window', async () => {
    const { fRes, eRes } = await hitBoth('/v1/auth/__parity_fail');
    expect(fRes.statusCode).toBe(429);
    expect(eRes.status).toBe(429);
    expect(String(fRes.body)).toBe(MESSAGE);
    expect(eRes.text).toBe(MESSAGE);
  });
});
