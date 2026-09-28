/**
 * Phase 2.9a gate: the Express reply/request surface transplanted onto
 * Fastify by src/plugins/replyCompat.ts.
 *
 * Every probe below is written twice - once the way the Express controllers
 * write it, once the same way on Fastify - and the two responses are diffed
 * header for header. The interesting ones are not the echoes:
 *
 *   - `res.send(string)`   Express picks `text/html`, Fastify picks
 *                          `text/plain`, and Express stamps `; charset=utf-8`
 *                          onto any Content-Type the controller already set.
 *                          The `text/csv` probe proves all three at once.
 *   - `res.send(null)`     Express rewrites the body to `''` and leaves
 *                          Content-Type alone; Fastify would answer `null`
 *                          as `application/json`.
 *   - `res.redirect`       `res.format` negotiates a body from Accept, adds
 *                          `Vary: Accept`, and never emits an ETag.
 *   - `res.cookie`         Express's `maxAge` is milliseconds and defaults
 *                          `path` to `/`; @fastify/cookie passes the raw
 *                          number through and omits the path entirely, which
 *                          would turn a 1-second cookie into a 1000-second
 *                          one scoped to the wrong URL.
 *   - `res.clearCookie`    @fastify/cookie adds `Max-Age=0`; Express does not.
 *
 * No MongoDB: every probe is synthetic and both apps boot offline.
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

/**
 * Transport/protocol headers that legitimately differ between servers, plus
 * content-length, because Express ends some responses chunked while Fastify
 * always recomputes a length for the buffered payload.
 */
const IGNORED_HEADERS = new Set([
  'date',
  'connection',
  'keep-alive',
  'transfer-encoding',
  'content-length',
]);

const MAX_AGE_OPTIONS = { httpOnly: true, secure: false, sameSite: 'lax', maxAge: 1000 };
const CLEAR_OPTIONS = { httpOnly: true, secure: false, sameSite: 'lax' };

function headerDiff(expressRes, fastifyRes) {
  const diffs = [];
  const keys = new Set([...Object.keys(expressRes.headers), ...Object.keys(fastifyRes.headers)]);
  for (const key of keys) {
    if (IGNORED_HEADERS.has(key)) continue;
    let a = expressRes.headers[key];
    let b = fastifyRes.headers[key];
    // Express exposes multiple Set-Cookie values as an array, light-my-request
    // as a single joined string when there is only one - same bytes, other shape.
    if (key === 'set-cookie') {
      if (a !== undefined && !Array.isArray(a)) a = [a];
      if (b !== undefined && !Array.isArray(b)) b = [b];
    }
    if (JSON.stringify(a) !== JSON.stringify(b)) {
      diffs.push(`${key}: express=${JSON.stringify(a)} fastify=${JSON.stringify(b)}`);
    }
  }
  return diffs;
}

describe('Phase 2.9a - Express reply/request compatibility layer', () => {
  let fastify;

  beforeAll(async () => {
    // app.js ends with catch-all 404, errorConverter, errorHandler - probes
    // registered from outside have to be spliced ahead of that catch-all, or
    // the 404 layer answers first.
    const stack = expressApp.router.stack;
    const insertAt = stack.length - 3;
    const appendedAt = stack.length;

    expressApp.get('/v1/__rc_json', (req, res) => res.status(201).json({ a: 1, b: 'two' }));
    expressApp.get('/v1/__rc_string', (req, res) => res.send('<b>hi</b>'));
    expressApp.get('/v1/__rc_object', (req, res) => res.send({ a: 1 }));
    expressApp.get('/v1/__rc_null', (req, res) => res.send(null));
    expressApp.get('/v1/__rc_csv', (req, res) => {
      res.setHeader('Content-Type', 'text/csv');
      res.send('a,b\n1,2');
    });
    expressApp.get('/v1/__rc_redirect', (req, res) =>
      res.redirect(303, 'https://example.com/cb?a=1&b=2')
    );
    expressApp.get('/v1/__rc_redirect_one', (req, res) => res.redirect('/one-arg'));
    expressApp.get('/v1/__rc_redirect_enc', (req, res) =>
      res.redirect(302, 'https://example.com/päth?q=a b&x=<z>')
    );
    expressApp.get('/v1/__rc_cookie', (req, res) => res.cookie('tok', 'abc', MAX_AGE_OPTIONS).send(''));
    expressApp.get('/v1/__rc_cookie_min', (req, res) => res.cookie('tok2', 'xyz').send(''));
    expressApp.get('/v1/__rc_clear', (req, res) => res.clearCookie('tok', CLEAR_OPTIONS).send(''));
    expressApp.get('/v1/__rc_request', (req, res) =>
      res.json({
        header: req.get('x-parity-header'),
        referer: req.get('Referrer'),
        refererAlias: req.get('referer'),
        missing: req.get('x-not-sent'),
        originalUrl: req.originalUrl,
        hasConnection: Boolean(req.connection),
        hasSocket: Boolean(req.socket),
        sameSocket: req.connection === req.socket,
        remoteAddressType: typeof (req.connection && req.connection.remoteAddress),
      })
    );

    stack.splice(insertAt, 0, ...stack.splice(appendedAt));

    fastify = await buildFastify();

    fastify.get('/v1/__rc_json', async (_req, reply) => reply.status(201).json({ a: 1, b: 'two' }));
    fastify.get('/v1/__rc_string', async (_req, reply) => reply.send('<b>hi</b>'));
    fastify.get('/v1/__rc_object', async (_req, reply) => reply.send({ a: 1 }));
    fastify.get('/v1/__rc_null', async (_req, reply) => reply.send(null));
    fastify.get('/v1/__rc_csv', async (_req, reply) => {
      reply.setHeader('Content-Type', 'text/csv');
      return reply.send('a,b\n1,2');
    });
    fastify.get('/v1/__rc_redirect', async (_req, reply) =>
      reply.redirect(303, 'https://example.com/cb?a=1&b=2')
    );
    fastify.get('/v1/__rc_redirect_one', async (_req, reply) => reply.redirect('/one-arg'));
    fastify.get('/v1/__rc_redirect_enc', async (_req, reply) =>
      reply.redirect(302, 'https://example.com/päth?q=a b&x=<z>')
    );
    fastify.get('/v1/__rc_cookie', async (_req, reply) => reply.cookie('tok', 'abc', MAX_AGE_OPTIONS).send(''));
    fastify.get('/v1/__rc_cookie_min', async (_req, reply) => reply.cookie('tok2', 'xyz').send(''));
    fastify.get('/v1/__rc_clear', async (_req, reply) => reply.clearCookie('tok', CLEAR_OPTIONS).send(''));
    fastify.get('/v1/__rc_request', async (req, reply) =>
      reply.json({
        header: req.get('x-parity-header'),
        referer: req.get('Referrer'),
        refererAlias: req.get('referer'),
        missing: req.get('x-not-sent'),
        originalUrl: req.originalUrl,
        hasConnection: Boolean(req.connection),
        hasSocket: Boolean(req.socket),
        sameSocket: req.connection === req.socket,
        remoteAddressType: typeof (req.connection && req.connection.remoteAddress),
      })
    );

    await fastify.ready();
  }, 60000);

  afterAll(async () => {
    if (fastify) await fastify.close();
  });

  async function compare(url, headers = {}, { method = 'GET', body } = {}) {
    let eReq = request(expressApp)[method.toLowerCase()](url);
    for (const [k, v] of Object.entries(headers)) eReq = eReq.set(k, v);
    if (body !== undefined) eReq = eReq.send(body);
    const eRes = await eReq;

    const fRes = await fastify.inject({ method, url, headers, payload: body });

    return {
      express: { status: eRes.status, headers: eRes.headers, text: eRes.text },
      fastify: { status: fRes.statusCode, headers: fRes.headers, text: fRes.body },
      diffs: headerDiff({ headers: eRes.headers }, { headers: fRes.headers }),
    };
  }

  const assertParity = (label, result) => {
    expect(result.diffs, `${label} header differences:\n${result.diffs.join('\n')}`).toEqual([]);
    expect(result.fastify.status, label).toBe(result.express.status);
    expect(result.fastify.text, `${label} body`).toBe(result.express.text);
  };

  it('status().json() is identical', async () => {
    const r = await compare('/v1/__rc_json');
    assertParity('json', r);
    expect(r.express.status).toBe(201);
    expect(JSON.parse(r.express.text)).toEqual({ a: 1, b: 'two' });
  });

  it('res.send(string) becomes text/html on both', async () => {
    const r = await compare('/v1/__rc_string');
    assertParity('send string', r);
    expect(r.express.headers['content-type']).toBe('text/html; charset=utf-8');
  });

  it('res.send(object) stays application/json on both', async () => {
    const r = await compare('/v1/__rc_object');
    assertParity('send object', r);
    expect(r.express.headers['content-type']).toBe('application/json; charset=utf-8');
  });

  it('res.send(null) is an empty body with no Content-Type on both', async () => {
    const r = await compare('/v1/__rc_null');
    assertParity('send null', r);
    expect(r.express.headers['content-type']).toBeUndefined();
    expect(r.express.headers.etag).toBeDefined();
    expect(r.express.text).toBe('');
  });

  it('a controller-chosen Content-Type survives res.send(string)', async () => {
    const r = await compare('/v1/__rc_csv');
    assertParity('csv', r);
    expect(r.express.headers['content-type']).toBe('text/csv; charset=utf-8');
    expect(r.express.text).toBe('a,b\n1,2');
  });

  const REDIRECT_ACCEPTS = [
    'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'application/json',
    'text/plain',
    '*/*',
    undefined,
  ];

  for (const accept of REDIRECT_ACCEPTS) {
    it(`res.redirect(303, url) with Accept: ${accept ?? '(none)'} is identical`, async () => {
      const headers = accept ? { accept } : {};
      const r = await compare('/v1/__rc_redirect', headers);
      assertParity('redirect', r);
      expect(r.express.status).toBe(303);
      expect(r.express.headers.location).toBe('https://example.com/cb?a=1&b=2');
      expect(r.express.headers.vary).toContain('Accept');
      expect(r.express.headers.etag).toBeUndefined();
    });
  }

  it('res.redirect(url) with one argument still defaults to 302', async () => {
    const r = await compare('/v1/__rc_redirect_one', { accept: 'text/html' });
    assertParity('redirect 1-arg', r);
    expect(r.express.status).toBe(302);
    expect(r.express.headers.location).toBe('/one-arg');
  });

  it('res.redirect encodes the Location the way encodeurl does', async () => {
    const r = await compare('/v1/__rc_redirect_enc', { accept: 'text/html' });
    assertParity('redirect encoded', r);
    expect(r.express.headers.location).toBe('https://example.com/p%C3%A4th?q=a%20b&x=%3Cz%3E');
    expect(r.express.text).toContain('&amp;x=');
  });

  it('res.cookie emits an identical Set-Cookie (maxAge is milliseconds)', async () => {
    const r = await compare('/v1/__rc_cookie');
    assertParity('cookie with options', r);
    const cookie = [].concat(r.express.headers['set-cookie'])[0];
    expect(cookie).toContain('Path=/');
    expect(cookie).toContain('Max-Age=1');
    expect(cookie).not.toContain('Max-Age=1000');
  });

  it('res.cookie without options keeps Express defaults (Path=/, no SameSite)', async () => {
    const r = await compare('/v1/__rc_cookie_min');
    assertParity('bare cookie', r);
    const cookie = [].concat(r.express.headers['set-cookie'])[0];
    expect(cookie).toBe('tok2=xyz; Path=/');
  });

  it('res.clearCookie emits an identical Set-Cookie (no Max-Age)', async () => {
    const r = await compare('/v1/__rc_clear');
    assertParity('clearCookie', r);
    const cookie = [].concat(r.express.headers['set-cookie'])[0];
    expect(cookie).not.toContain('Max-Age');
    expect(cookie).toContain('Expires=Thu, 01 Jan 1970');
  });

  it('req.get / req.originalUrl / req.connection behave identically', async () => {
    const r = await compare('/v1/__rc_request', {
      'x-parity-header': 'present',
      referer: 'https://ref.example/',
    });
    assertParity('request surface', r);

    const parsed = JSON.parse(r.express.text);
    expect(parsed.header).toBe('present');
    expect(parsed.referer).toBe('https://ref.example/');
    expect(parsed.refererAlias).toBe('https://ref.example/');
    expect(parsed.missing).toBeUndefined();
    expect(parsed.originalUrl).toBe('/v1/__rc_request');
    expect(parsed.hasConnection).toBe(true);
    expect(parsed.sameSocket).toBe(true);
  });
});
