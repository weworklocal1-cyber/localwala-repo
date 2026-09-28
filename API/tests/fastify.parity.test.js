/**
 * Phase 2.2-2.4 gate: the Fastify shell must behave like the Express app.
 *
 * Nothing is mounted on `/v1` yet, so this compares the cross-cutting
 * surface only - the landing page, 404 shape, CORS, security headers, body
 * limit and query parser. Route parity stays with http.smoke.test.js.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';

const app = (await import('../src/app')).default;
const { buildFastify } = await import('../src/fastify');

/** `Server Time:` changes every render; compare everything around it. */
const normalizeHtml = (html) => html.replace(/Server Time: [^<]+/, 'Server Time: <t>');

/**
 * Transport/protocol headers that legitimately differ between servers.
 *
 * - date/connection/keep-alive/transfer-encoding: inherent to two servers.
 * - content-length: Express pipes compressed output and so uses chunked
 *   transfer, while Fastify recomputes a content-length for the buffered
 *   payload *after* onSend hooks. Identical bytes, different framing; not
 *   reproducible from application code.
 */
const IGNORED_HEADERS = new Set([
  'date',
  'connection',
  'keep-alive',
  'transfer-encoding',
  'content-length',
]);

async function getExpress(url, headers = {}) {
  const res = await request(app).get(url).set(headers);
  return { status: res.status, headers: res.headers, body: res.body, text: res.text };
}

async function getFastify(fastify, url, headers = {}) {
  const res = await fastify.inject({ method: 'GET', url, headers });
  const isJson = (res.headers['content-type'] || '').includes('application/json');
  return {
    status: res.statusCode,
    headers: res.headers,
    body: isJson ? res.json() : undefined,
    text: res.body,
  };
}

function headerDiff(expressRes, fastifyRes) {
  const diffs = [];
  const keys = new Set([...Object.keys(expressRes.headers), ...Object.keys(fastifyRes.headers)]);
  for (const key of keys) {
    if (IGNORED_HEADERS.has(key)) continue;
    const a = expressRes.headers[key];
    const b = fastifyRes.headers[key];
    if (a !== b) diffs.push(`${key}: express=${JSON.stringify(a)} fastify=${JSON.stringify(b)}`);
  }
  return diffs;
}

describe('Phase 2.2-2.4: Fastify shell parity with Express', () => {
  let fastify;
  let expressQuery;
  let fastifyQuery;

  beforeAll(async () => {
    fastify = await buildFastify();

    // Probe routes must be registered before ready() - Fastify freezes the
    // route table at that point. They exist only so the body limit and the
    // query parser can be observed on the Fastify side.
    fastify.get('/__query_probe', async (req) => {
      fastifyQuery = req.query;
      return { ok: true };
    });
    fastify.post('/__body_probe', async () => ({ ok: true }));

    await fastify.ready();
  });

  afterAll(async () => {
    if (fastify) await fastify.close();
  });

  it('GET / serves byte-identical HTML from both servers', async () => {
    const [expressRes, fastifyRes] = await Promise.all([
      getExpress('/'),
      getFastify(fastify, '/'),
    ]);

    expect(fastifyRes.status).toBe(200);
    expect(expressRes.status).toBe(200);
    expect(normalizeHtml(fastifyRes.text)).toBe(normalizeHtml(expressRes.text));
    expect(fastifyRes.headers['content-type']).toBe(expressRes.headers['content-type']);
    expect(fastifyRes.headers['content-type']).toMatch(/^text\/html/);
  });

  it('unknown URL returns the same 404 JSON body', async () => {
    const headers = { 'accept-encoding': 'gzip, deflate' };
    const [expressRes, fastifyRes] = await Promise.all([
      getExpress('/definitely-not-a-route', headers),
      getFastify(fastify, '/definitely-not-a-route', headers),
    ]);

    expect(expressRes.status).toBe(404);
    expect(fastifyRes.status).toBe(404);

    const strip = ({ stack, ...rest }) => rest;
    expect(strip(fastifyRes.body)).toEqual(strip(expressRes.body));
    expect(fastifyRes.body).toMatchObject({ success: false, code: 404, message: 'Not found' });
    expect(fastifyRes.headers['content-type']).toBe(expressRes.headers['content-type']);

    // A 404 JSON body is far below @fastify/compress's 1KB threshold, and this
    // is exactly where Express's `vary(res, 'Accept-Encoding')` (which runs
    // before its own size check) diverges from @fastify/compress's (which runs
    // after). Comparing headers here too keeps that regression visible.
    const diffs = headerDiff(expressRes, fastifyRes);
    expect(diffs, `header differences:\n${diffs.join('\n')}`).toEqual([]);
  });

  it('response headers match, including the helmet CSP', async () => {
    // supertest always sends Accept-Encoding; make Fastify do the same so the
    // compression-dependent headers are compared like for like.
    const headers = { 'accept-encoding': 'gzip, deflate' };
    const [expressRes, fastifyRes] = await Promise.all([
      getExpress('/', headers),
      getFastify(fastify, '/', headers),
    ]);

    const diffs = headerDiff(expressRes, fastifyRes);
    expect(diffs, `header differences:\n${diffs.join('\n')}`).toEqual([]);

    // Belt and braces: these are the ones clients actually key off.
    expect(expressRes.headers['x-frame-options']).toBe('DENY');
    expect(expressRes.headers['x-content-type-options']).toBe('nosniff');
    expect(expressRes.headers['x-xss-protection']).toBe('1; mode=block');
    expect(expressRes.headers['content-security-policy']).toBe(
      fastifyRes.headers['content-security-policy']
    );
    expect(expressRes.headers['x-powered-by']).toBeUndefined();
    expect(fastifyRes.headers['x-powered-by']).toBeUndefined();
  });

  it('CORS allows a configured origin on both', async () => {
    const headers = { Origin: 'http://localhost:3000' };
    const [expressRes, fastifyRes] = await Promise.all([
      getExpress('/', headers),
      getFastify(fastify, '/', headers),
    ]);

    expect(expressRes.headers['access-control-allow-origin']).toBe('http://localhost:3000');
    expect(fastifyRes.headers['access-control-allow-origin']).toBe('http://localhost:3000');
    expect(expressRes.headers['access-control-allow-credentials']).toBe('true');
    expect(fastifyRes.headers['access-control-allow-credentials']).toBe('true');
  });

  it('CORS rejects a foreign origin with the same 403 body', async () => {
    const headers = { Origin: 'https://evil.example' };
    const [expressRes, fastifyRes] = await Promise.all([
      getExpress('/', headers),
      getFastify(fastify, '/', headers),
    ]);

    expect(expressRes.status).toBe(403);
    expect(fastifyRes.status).toBe(403);

    const strip = ({ stack, ...rest }) => rest;
    expect(strip(fastifyRes.body)).toEqual(strip(expressRes.body));
    expect(fastifyRes.body).toMatchObject({ success: false, code: 403 });
    expect(fastifyRes.headers['access-control-allow-origin']).toBeUndefined();
    expect(expressRes.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('rejects a body over 5MB on both servers', async () => {
    const oversized = JSON.stringify({ filler: 'x'.repeat(5 * 1024 * 1024) });

    const expressRes = await request(app)
      .post('/v1/auth/login')
      .set('Content-Type', 'application/json')
      .send(oversized);

    const fastifyRes = await fastify.inject({
      method: 'POST',
      url: '/__body_probe',
      headers: { 'content-type': 'application/json' },
      payload: oversized,
    });

    expect(expressRes.status).toBe(413);
    expect(fastifyRes.statusCode).toBe(413);
  });

  it('parses nested query strings the same way on both servers', async () => {
    // Express 5 switched the default query parser to `simple` (Node's
    // querystring), so `?a[b]=1` stays a flat key rather than becoming a
    // nested object the way Express 4's `extended` (qs) parser did.
    const expressApp = (await import('express')).default;
    const probe = expressApp();
    probe.get('/q', (req, res) => {
      expressQuery = req.query;
      res.end();
    });
    await request(probe).get('/q?a[b]=1&c[]=2&c[]=3');

    await fastify.inject({ method: 'GET', url: '/__query_probe?a[b]=1&c[]=2&c[]=3' });

    expect(fastifyQuery).toEqual(expressQuery);
    expect(expressQuery).toEqual({ 'a[b]': '1', 'c[]': ['2', '3'] });
  });
});
