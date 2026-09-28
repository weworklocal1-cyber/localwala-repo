/**
 * Phase 2.8 parity gate: the XSS + mongo-sanitize middleware pair that
 * src/app.js installs globally at lines 178-196.
 *
 *     app.use((req, res, next) => xss({ sanitizeQuery: true, sanitizeBody: true })(...))
 *     app.use((req, res, next) => { mongoSanitize.sanitize(req.body); ... })
 *
 * On Fastify these become two instance `preValidation` hooks registered in
 * src/fastify.ts. The interesting property is *ordering*, so every probe below
 * is a discriminator rather than a plain echo:
 *
 *   - `xss` must run BEFORE `validate`. sanitize-html turns
 *     `<img src=x onerror=alert(1)>` into the empty string, so a Joi schema of
 *     `Joi.string().valid('')` returns 200 if sanitization happened first and
 *     400 if Joi saw the raw markup.
 *   - `mongoSanitize` must also run BEFORE `validate`. Its regex is `/^\$|\./`,
 *     so it deletes the `a.b` key; Joi rejects unknown keys, giving the same
 *     200-vs-400 split.
 *   - the two trusted prefixes in app.js must skip `xss` entirely, which is
 *     only observable as *sanitization NOT happening*.
 *   - and the inverse: route params must NOT be sanitized on either server.
 *     Express calls `app.use(xss)` before the router, so `req.params` is still
 *     `{}` there and the middleware's `req.params = sanitize(req.params)` is a
 *     no-op. Fastify blanks params around the middleware to match. A 200 here
 *     means one side started "helpfully" sanitizing params on its own.
 *
 * Fastify concatenates instance hooks ahead of route-level ones
 * (node_modules/fastify/lib/route.js:391-394), which is the property these
 * assertions are actually pinning.
 *
 * Also covers the `express.urlencoded({ extended: true })` parser, because
 * body parity has to be established before body sanitization means anything.
 * No MongoDB: every probe is synthetic and the app boots offline.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createRequire } from 'node:module';

const require_ = createRequire(import.meta.url);
const config = require_('../src/config/config');
const morgan = require_('../src/config/morgan');
const validate = require_('../src/middlewares/validate');
const Joi = require_('joi');

const originalEnv = config.env;

// Same require-cache patch as tests/ratelimit.parity.test.js: morgan logs
// every probe through winston and vi.mock cannot intercept CommonJS here.
morgan.successHandler = (_req, _res, next) => next();
morgan.errorHandler = (_req, _res, next) => next();

const expressApp = (await import('../src/app')).default;
const { buildFastify } = await import('../src/fastify');

const XSS_PAYLOAD = '<img src=x onerror=alert(1)>';
const ENCODED_XSS_PAYLOAD = encodeURIComponent(XSS_PAYLOAD);

const querySchema = { query: Joi.object({ name: Joi.string().valid('') }) };
const bodySchema = { body: Joi.object({ name: Joi.string() }) };
const paramsSchema = { params: Joi.object({ slug: Joi.string().valid('') }) };

describe('Phase 2.8 - express-xss-sanitizer + express-mongo-sanitize parity', () => {
  let fastify;

  beforeAll(async () => {
    // app.js ends with a catch-all 404, errorConverter, errorHandler - probes
    // registered from outside have to be spliced in ahead of that catch-all or
    // they are unreachable. Captured before appending so the index still points
    // at the catch-all once the probes are in.
    const stack = expressApp.router.stack;
    const insertAt = stack.length - 3;
    const appendedAt = stack.length;

    expressApp.get('/v1/__parity_sanitize', validate(querySchema), (req, res) =>
      res.status(200).json({ query: req.query })
    );
    expressApp.post('/v1/__parity_sanitize', validate(bodySchema), (req, res) =>
      res.status(200).json({ body: req.body })
    );
    expressApp.get('/v1/__parity_sanitize/:slug', validate(paramsSchema), (req, res) =>
      res.status(200).json({ params: req.params })
    );
    // app.js trusts anything starting with this string, with no path boundary.
    expressApp.get('/v1/admin/app_pages__parity', (req, res) =>
      res.status(200).json({ query: req.query })
    );
    expressApp.post('/v1/__parity_form', (req, res) =>
      res.status(200).json({ body: req.body })
    );
    expressApp.post('/v1/__parity_json', (req, res) =>
      res.status(200).json({ body: req.body ?? null })
    );

    stack.splice(insertAt, 0, ...stack.splice(appendedAt));

    fastify = await buildFastify();
    fastify.get('/v1/__parity_sanitize', { preValidation: validate(querySchema) }, async (req) => ({
      query: req.query,
    }));
    fastify.post('/v1/__parity_sanitize', { preValidation: validate(bodySchema) }, async (req) => ({
      body: req.body,
    }));
    fastify.get(
      '/v1/__parity_sanitize/:slug',
      { preValidation: validate(paramsSchema) },
      async (req) => ({ params: req.params })
    );
    fastify.get('/v1/admin/app_pages__parity', async (req) => ({ query: req.query }));
    fastify.post('/v1/__parity_form', async (req) => ({ body: req.body }));
    fastify.post('/v1/__parity_json', async (req) => ({ body: req.body ?? null }));
    await fastify.ready();
  }, 60000);

  afterAll(async () => {
    if (fastify) await fastify.close();
    config.env = originalEnv;
  });

  it('sanitizes the query string before Joi sees it, on both servers', async () => {
    const url = `/v1/__parity_sanitize?name=${ENCODED_XSS_PAYLOAD}`;
    const [fRes, eRes] = await Promise.all([
      fastify.inject({ method: 'GET', url }),
      request(expressApp).get(url),
    ]);

    expect(eRes.status, 'express - xss must run before validate').toBe(200);
    expect(fRes.statusCode, 'fastify - xss must run before validate').toBe(200);
    expect(eRes.body).toEqual({ query: { name: '' } });
    expect(fRes.json()).toEqual({ query: { name: '' } });
  });

  it('does NOT sanitize route params on either server', async () => {
    // Express's app.use(xss) runs before the router, so req.params is still {}
    // there and the middleware's `req.params = sanitize(req.params)` is a
    // no-op - the raw markup reaches Joi and Joi rejects it. Fastify blanks
    // params around the middleware to reproduce that. Both must 400 with the
    // same body; a 200 on either side means someone "helpfully" started
    // sanitizing params on one server only.
    const url = `/v1/__parity_sanitize/${ENCODED_XSS_PAYLOAD}`;
    const [fRes, eRes] = await Promise.all([
      fastify.inject({ method: 'GET', url }),
      request(expressApp).get(url),
    ]);

    expect(eRes.status, 'express').toBe(400);
    expect(fRes.statusCode, 'fastify').toBe(400);
    expect(fRes.json()).toEqual(eRes.body);
    expect(eRes.body).toMatchObject({ success: false, code: 400 });
    expect(String(eRes.body.message)).toContain('slug');
  });

  it('strips `$` and dotted keys from the body before Joi sees it', async () => {
    const payload = { name: 'ok', 'a.b': 'should-not-survive', $where: 'x' };
    const [fRes, eRes] = await Promise.all([
      fastify.inject({ method: 'POST', url: '/v1/__parity_sanitize', payload }),
      request(expressApp).post('/v1/__parity_sanitize').send(payload),
    ]);

    expect(eRes.status, 'express - mongoSanitize must run before validate').toBe(200);
    expect(fRes.statusCode, 'fastify - mongoSanitize must run before validate').toBe(200);
    expect(eRes.body).toEqual({ body: { name: 'ok' } });
    expect(fRes.json()).toEqual({ body: { name: 'ok' } });
  });

  it('skips sanitization on the two trusted raw-HTML prefixes', async () => {
    const url = `/v1/admin/app_pages__parity?name=${ENCODED_XSS_PAYLOAD}`;
    const [fRes, eRes] = await Promise.all([
      fastify.inject({ method: 'GET', url }),
      request(expressApp).get(url),
    ]);

    expect(eRes.status, 'express - probe was not reached').toBe(200);
    expect(fRes.statusCode, 'fastify - probe was not reached').toBe(200);
    expect(eRes.body).toEqual({ query: { name: XSS_PAYLOAD } });
    expect(fRes.json()).toEqual({ query: { name: XSS_PAYLOAD } });
  });

  it('parses urlencoded bodies with the same extended (qs) semantics', async () => {
    const form = 'a[b]=1&c[]=2&c[]=3&d.e=5&name=<b>hi</b>';
    const [fRes, eRes] = await Promise.all([
      fastify.inject({
        method: 'POST',
        url: '/v1/__parity_form',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        payload: form,
      }),
      request(expressApp)
        .post('/v1/__parity_form')
        .set('content-type', 'application/x-www-form-urlencoded')
        .send(form),
    ]);

    expect(eRes.status).toBe(200);
    expect(fRes.statusCode).toBe(200);
    // `d.e` is removed by mongoSanitize on both sides; `a[b]` must nest and
    // `c[]` must become an array, which fast-querystring would not do.
    expect(fRes.json()).toEqual(eRes.body);
    expect(eRes.body).toEqual({
      body: { a: { b: '1' }, c: ['2', '3'], name: '<b>hi</b>' },
    });
  });

  it('sanitizes urlencoded bodies the same way on both servers', async () => {
    const form = `name=${encodeURIComponent(XSS_PAYLOAD)}`;
    const [fRes, eRes] = await Promise.all([
      fastify.inject({
        method: 'POST',
        url: '/v1/__parity_form',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        payload: form,
      }),
      request(expressApp)
        .post('/v1/__parity_form')
        .set('content-type', 'application/x-www-form-urlencoded')
        .send(form),
    ]);

    expect(eRes.status).toBe(200);
    expect(fRes.statusCode).toBe(200);
    expect(fRes.json()).toEqual(eRes.body);
    expect(eRes.body).toEqual({ body: { name: '' } });
  });

  it('leaves a clean JSON body untouched on both servers', async () => {
    const payload = { name: 'plain', nested: { list: ['a', 'b'] } };
    const [fRes, eRes] = await Promise.all([
      fastify.inject({ method: 'POST', url: '/v1/__parity_json', payload }),
      request(expressApp).post('/v1/__parity_json').send(payload),
    ]);

    expect(eRes.status).toBe(200);
    expect(fRes.statusCode).toBe(200);
    expect(fRes.json()).toEqual(eRes.body);
    expect(eRes.body).toEqual({ body: payload });
  });

  it('rejects `__proto__` JSON keys where Express accepts them (documented)', async () => {
    // The one place the two body parsers genuinely disagree, and it is not
    // something Phase 2 fixes: body-parser parses with plain `JSON.parse`
    // (body-parser/lib/types/json.js:72) and
    // express-mongo-sanitize does not strip `__proto__` either (its regex is
    // /^\$|\./), so Express returns 200 with an own `__proto__` property.
    // Fastify parses through secure-json-parse, which rejects the key outright.
    // Fastify is the stricter of the two; tightening Express is a security
    // decision for Phase 9, so the divergence is recorded rather than papered
    // over. `constructor` behaves the same way.
    const raw = '{"name":"ok","__proto__":{"polluted":true}}';
    const [fRes, eRes] = await Promise.all([
      fastify.inject({
        method: 'POST',
        url: '/v1/__parity_json',
        headers: { 'content-type': 'application/json' },
        payload: raw,
      }),
      request(expressApp)
        .post('/v1/__parity_json')
        .set('content-type', 'application/json')
        .send(raw),
    ]);

    expect(eRes.status, 'express').toBe(200);
    expect(eRes.body).toMatchObject({ body: { name: 'ok' } });
    expect(fRes.statusCode, 'fastify').toBe(400);
    // Fastify normalises secure-json-parse's rejection into its generic
    // FST_ERR_CTP_INVALID_JSON, so the key name never surfaces.
    expect(String(fRes.json().message)).toBe(
      "Body is not valid JSON but content-type is set to 'application/json'"
    );
  });
});
