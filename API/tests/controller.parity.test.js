/**
 * Phase 2.12 gate: the controller request surface both "hardest" controllers
 * stand on, plus the async-flow shape the GCS flattening established.
 *
 * `auth.controller.js` reads the client through three module-private helpers
 * (`getClientIp`, `isSecureRequest`, and `` `${req.protocol}://${req.get('host')}` ``
 * for verification links, also used by `payment.initiation.controller.js`).
 * The probe below evaluates their exact expressions on both servers, so any
 * divergence in `req.ip` / `req.socket` / `req.secure` / `req.protocol` /
 * `req.get('host')` fails loudly rather than forging a wrong link or cookie
 * flag in production. Forwarded-header cases are fully deterministic; the
 * no-header `ip` fallback depends on the test harness socket and is asserted
 * loosely (production sockets are identical - both read `remoteAddress`).
 *
 * The event probes pin the flow shape Phase 2.12 requires: a response sent
 * after an *awaited* event arrives on both servers, where the old
 * fire-and-forget shape answered an empty 200 on Fastify (proven with a
 * `setTimeout` probe during 2.11). `file.controller.js`'s GCS branch is the
 * only production site of that shape; these probes prove the replacement
 * pattern delivers.
 *
 * No MongoDB: every probe is synthetic.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createRequire } from 'node:module';

const require_ = createRequire(import.meta.url);
const morgan = require_('../src/config/morgan');

// Same require-cache patch as the other parity tests - vi.mock cannot
// intercept CommonJS, so the cached morgan exports are stubbed instead.
morgan.successHandler = (_req, _res, next) => next();
morgan.errorHandler = (_req, _res, next) => next();

const { PassThrough } = require_('node:stream');

const expressApp = (await import('../src/app')).default;
const { buildFastify } = await import('../src/fastify');

// Verbatim from src/controllers/auth.controller.js getClientIp/isSecureRequest
// plus the currentURL template used in 7 places across auth.controller.js and
// payment.initiation.controller.js.
function surfaceOf(req, res) {
  const forwarded = req.headers['x-forwarded-for'];
  const ip =
    typeof forwarded === 'string' && forwarded.length > 0
      ? forwarded.split(',')[0].trim()
      : req.ip || req.socket?.remoteAddress || '0.0.0.0';
  const forwardedProto = req.headers['x-forwarded-proto'];
  const secure =
    typeof forwardedProto === 'string' && forwardedProto.toLowerCase().includes('https')
      ? true
      : Boolean(req.secure);
  res.json({
    ip,
    secure,
    protocol: req.protocol,
    host: req.get('host'),
    url: `${req.protocol}://${req.get('host')}/cb`,
  });
}

async function eventSuccess(req, res) {
  const stream = new PassThrough();
  const done = new Promise((resolve, reject) => {
    stream.on('error', reject);
    stream.on('finish', resolve);
  });
  stream.end('payload');
  try {
    await done;
    res.status(200).json({ path: 'uploaded' });
  } catch (error) {
    res.status(500).json({ code: 500, message: 'upload failed', extra: error.message });
  }
}

async function eventFailure(req, res) {
  const stream = new PassThrough();
  const done = new Promise((resolve, reject) => {
    stream.on('error', reject);
    stream.on('finish', resolve);
  });
  stream.destroy(new Error('write failed'));
  try {
    await done;
    res.status(200).json({ path: 'uploaded' });
  } catch (error) {
    res.status(500).json({ code: 500, message: 'upload failed', extra: error.message });
  }
}

describe('Phase 2.12 - controller request surface and async flows', () => {
  let fastify;

  beforeAll(async () => {
    // Express probes: spliced ahead of app.js's catch-all, like every other
    // parity suite in this repo.
    const stack = expressApp.router.stack;
    const insertAt = stack.length - 3;
    const appendedAt = stack.length;

    expressApp.get('/v1/__ctrl_surface', (req, res) => surfaceOf(req, res));
    expressApp.get('/v1/__ctrl_event_ok', (req, res) => eventSuccess(req, res));
    expressApp.get('/v1/__ctrl_event_fail', (req, res) => eventFailure(req, res));

    stack.splice(insertAt, 0, ...stack.splice(appendedAt));

    fastify = await buildFastify();

    fastify.get('/v1/__ctrl_surface', (request, reply) => surfaceOf(request, reply));
    fastify.get('/v1/__ctrl_event_ok', (request, reply) => eventSuccess(request, reply));
    fastify.get('/v1/__ctrl_event_fail', (request, reply) => eventFailure(request, reply));

    await fastify.ready();
  }, 60000);

  afterAll(async () => {
    if (fastify) await fastify.close();
  });

  async function compare(url, headers = {}) {
    let eReq = request(expressApp).get(url);
    for (const [k, v] of Object.entries(headers)) eReq = eReq.set(k, v);
    const eRes = await eReq;
    const fRes = await fastify.inject({ method: 'GET', url, headers });
    return {
      express: { status: eRes.status, text: eRes.text },
      fastify: { status: fRes.statusCode, text: fRes.body },
    };
  }

  it('proxied request surface is identical', async () => {
    const r = await compare('/v1/__ctrl_surface', {
      'x-forwarded-for': '203.0.113.7, 70.41.3.18',
      'x-forwarded-proto': 'https',
      host: 'shop.example.com',
    });
    expect(r.fastify.status).toBe(r.express.status);
    expect(r.fastify.text).toBe(r.express.text);
    expect(JSON.parse(r.express.text)).toEqual({
      ip: '203.0.113.7',
      secure: true,
      protocol: 'http',
      host: 'shop.example.com',
      url: 'http://shop.example.com/cb',
    });
  });

  it('direct request surface matches except the harness socket address', async () => {
    const r = await compare('/v1/__ctrl_surface', { host: 'shop.example.com' });
    const eBody = JSON.parse(r.express.text);
    const fBody = JSON.parse(r.fastify.text);
    expect(fBody.secure).toBe(eBody.secure);
    expect(fBody.protocol).toBe(eBody.protocol);
    expect(fBody.host).toBe(eBody.host);
    expect(fBody.url).toBe(eBody.url);
    expect(fBody.secure).toBe(false);
    expect(fBody.protocol).toBe('http');
  });

  it('response after an awaited stream event arrives on both', async () => {
    const r = await compare('/v1/__ctrl_event_ok');
    expect(r.fastify.status).toBe(r.express.status);
    expect(r.fastify.text).toBe(r.express.text);
    expect(JSON.parse(r.express.text)).toEqual({ path: 'uploaded' });
  });

  it('stream error after an awaited event answers identically', async () => {
    const r = await compare('/v1/__ctrl_event_fail');
    expect(r.fastify.status).toBe(r.express.status);
    expect(r.fastify.text).toBe(r.express.text);
    expect(r.express.status).toBe(500);
  });
});
