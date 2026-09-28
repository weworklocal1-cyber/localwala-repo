/**
 * Phase 2.9b/2.9c gate: a converted route file serves both servers.
 *
 * `src/routes/v1/file.route.js` (2.9b) and `waiter.route.js` (2.9c) have been
 * moved to Fastify's `route({ method, url, preHandler, handler })` shape. Their
 * declarations are replayed by `src/routes/routeRegistrar.js`:
 *
 *   - Express gets the same `router.post(url, ...preHandler, handler)` layers
 *     it always got, which is why `manifest:check` is still 0/0/0.
 *   - Fastify gets the same handlers with `/v1/file` baked into the URL and
 *     the passport-closed `appAuth(...)`/`webAuth(...)` rebuilt through
 *     `createFastifyAuth`.
 *
 * The assertions are deliberately about *behaviour*, not about the route
 * table: a Fastify route that exists but answers differently is the failure
 * this test exists to catch. Files that have not been converted yet are
 * asserted absent, because that is the correct intermediate state.
 *
 * No MongoDB: every request dies at the auth layer.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createRequire } from 'node:module';

const require_ = createRequire(import.meta.url);
const morgan = require_('../src/config/morgan');

// Same require-cache patch as tests/sanitize.parity.test.js - vi.mock cannot
// intercept CommonJS, so the cached morgan exports are stubbed instead.
morgan.successHandler = (_req, _res, next) => next();
morgan.errorHandler = (_req, _res, next) => next();

const expressApp = (await import('../src/app')).default;
const { buildFastify } = await import('../src/fastify');

const JSON_BODY = { 'content-type': 'application/json', accept: 'application/json' };

describe('Phase 2.9 - converted route files registered on both servers', () => {
  let fastify;

  beforeAll(async () => {
    fastify = await buildFastify();
    await fastify.ready();
  }, 60000);

  afterAll(async () => {
    if (fastify) await fastify.close();
  });

  async function compare(method, url, headers = {}, body) {
    let eReq = request(expressApp)[method.toLowerCase()](url);
    for (const [k, v] of Object.entries(headers)) eReq = eReq.set(k, v);
    if (body !== undefined) eReq = eReq.send(body);
    const eRes = await eReq;

    const fRes = await fastify.inject({ method, url, headers, payload: body });

    return {
      express: { status: eRes.status, text: eRes.text, type: eRes.headers['content-type'] },
      fastify: { status: fRes.statusCode, text: fRes.body, type: fRes.headers['content-type'] },
    };
  }

  it('registers every converted route on Fastify', () => {
    expect(fastify.hasRoute({ method: 'POST', url: '/v1/file/uploadImage' })).toBe(true);
    expect(fastify.hasRoute({ method: 'POST', url: '/v1/file/web_upload_image' })).toBe(true);
    expect(fastify.hasRoute({ method: 'GET', url: '/v1/waiter/profile/user/:id' })).toBe(true);
    expect(fastify.hasRoute({ method: 'GET', url: '/v1/waiter/delete_account_reason_list' })).toBe(
      true
    );
  });

  it('leaves unconverted files on Express only', () => {
    expect(fastify.hasRoute({ method: 'GET', url: '/v1/kitchen/profile/me/:uid' })).toBe(false);
    expect(fastify.hasRoute({ method: 'GET', url: '/v1/public/getVendorSettings' })).toBe(false);
  });

  it('waiter.route.js - converted route answers 401 identically without a token', async () => {
    const r = await compare('GET', '/v1/waiter/profile/user/654321098765432109876543', {
      accept: 'application/json',
    });
    expect(r.fastify.status).toBe(r.express.status);
    expect(r.fastify.text).toBe(r.express.text);
    expect(r.express.status).toBe(401);
  });

  it('waiter.route.js - a route with no validate() stage also matches', async () => {
    const r = await compare('GET', '/v1/waiter/delete_account_reason_list', {
      accept: 'application/json',
    });
    expect(r.fastify.status).toBe(r.express.status);
    expect(r.fastify.text).toBe(r.express.text);
    expect(r.express.status).toBe(401);
  });

  it('waiter.route.js - an unknown path under the mount is 404 on both', async () => {
    const r = await compare('GET', '/v1/waiter/does-not-exist', { accept: 'application/json' });
    expect(r.fastify.status).toBe(r.express.status);
    expect(r.fastify.text).toBe(r.express.text);
    expect(r.express.status).toBe(404);
  });

  it('POST /v1/file/uploadImage without a token is 401 on both', async () => {
    const r = await compare('POST', '/v1/file/uploadImage', JSON_BODY, {});
    expect(r.fastify.status).toBe(r.express.status);
    expect(r.fastify.text).toBe(r.express.text);
    expect(r.express.status).toBe(401);
  });

  it('POST /v1/file/web_upload_image without a token is 401 on both', async () => {
    const r = await compare('POST', '/v1/file/web_upload_image', JSON_BODY, {});
    expect(r.fastify.status).toBe(r.express.status);
    expect(r.fastify.text).toBe(r.express.text);
    expect(r.express.status).toBe(401);
  });

  it('a garbage Bearer token is 401 on both, same body', async () => {
    const headers = { ...JSON_BODY, authorization: 'Bearer not.a.token' };
    const r = await compare('POST', '/v1/file/uploadImage', headers, {});
    expect(r.fastify.status).toBe(r.express.status);
    expect(r.fastify.text).toBe(r.express.text);
    expect(r.express.status).toBe(401);
  });

  it('an unknown path under the converted mount is 404 on both', async () => {
    const r = await compare('GET', '/v1/file/does-not-exist', { accept: 'application/json' });
    expect(r.fastify.status).toBe(r.express.status);
    expect(r.fastify.text).toBe(r.express.text);
    expect(r.express.status).toBe(404);
  });
});
