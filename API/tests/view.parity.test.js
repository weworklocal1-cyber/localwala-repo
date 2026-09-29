/**
 * Phase 2.13 gate: rendered views are byte-identical on both servers.
 *
 * Both servers run the *same* `es6Renderer` function - Express through
 * `res.render`, Fastify through `src/utils/renderView.js` - so these probes
 * pin the wiring rather than the substitution: locals unwrapping, the
 * `text/html; charset=utf-8` content type Express's `res.send` assigns,
 * static templates with no locals, and the missing-template error shape
 * (the engine crashes without a callback, so the helper always passes one -
 * matching Express, which always does).
 *
 * No MongoDB: every probe renders synthetic locals.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createRequire } from 'node:module';

const require_ = createRequire(import.meta.url);
const morgan = require_('../src/config/morgan');

// Same require-cache patch as the other parity tests - vi.mock cannot
// intercept CommonJS, so the cached morgan exports are stubbed instead.
morgan.successHandler = (_req, _res, next) => next();
morgan.errorHandler = (_req, _res, next) => next();

const renderView = require_('../src/utils/renderView');
const zlib = require_('node:zlib');
const http = require_('node:http');

const expressApp = (await import('../src/app')).default;
const { buildFastify } = await import('../src/fastify');

const MSG91_LOCALS = {
  widgetId: 'w123',
  tokenAuth: 't456',
  phoneNumber: '9999999999',
  callBackURL: 'https://shop.example.com/cb',
  appLocale: 'en',
};

const FIREBASE_LOCALS = {
  apiKey: 'ak',
  authDomain: 'ad',
  projectId: 'pid',
  storageBucket: 'sb',
  messagingSenderId: 'msi',
  appId: 'aid',
  measurementId: 'mid',
  mobileNumber: '9999999999',
  callBackURL: 'https://shop.example.com/cb',
  appLocale: 'en',
};

/**
 * Transport headers that legitimately differ: timing/connection, plus
 * `content-length`/`transfer-encoding`, because Express pipes compressed
 * output (chunked, no length) while Fastify buffers it (length, no chunks) -
 * the accepted 2.2-2.4 difference. Everything else is compared.
 */
const IGNORED_HEADERS = new Set(['date', 'connection', 'keep-alive', 'content-length', 'transfer-encoding']);

function headerDiff(expressHeaders, fastifyHeaders) {
  const diffs = [];
  const keys = new Set([...Object.keys(expressHeaders), ...Object.keys(fastifyHeaders)]);
  for (const key of keys) {
    if (IGNORED_HEADERS.has(key)) continue;
    const a = expressHeaders[key];
    const b = fastifyHeaders[key];
    if (JSON.stringify(a) !== JSON.stringify(b)) {
      diffs.push(`${key}: express=${JSON.stringify(a)} fastify=${JSON.stringify(b)}`);
    }
  }
  return diffs;
}

describe('Phase 2.13 - view rendering parity', () => {
  let fastify;
  let eSrv;
  let ePort;
  let fPort;

  async function getBytes(port, urlPath) {
    return new Promise((resolve, reject) => {
      // agent:false so sockets close after each response - otherwise the
      // keep-alive connections hang server.close() in afterAll.
      const req = http.get(
        { port, path: urlPath, headers: { 'accept-encoding': 'gzip, deflate' }, agent: false },
        (res) => {
          const chunks = [];
          res.on('data', (c) => chunks.push(c));
          res.on('end', () => {
            const raw = Buffer.concat(chunks);
            // Both servers are fetched over real HTTP and decoded here:
            // supertest gunzips transparently but inject mangles binary.
            try {
              const text =
                res.headers['content-encoding'] === 'gzip'
                  ? zlib.gunzipSync(raw).toString('utf8')
                  : raw.toString('utf8');
              resolve({ status: res.statusCode, headers: res.headers, text });
            } catch (err) {
              reject(
                new Error(
                  `gunzip failed port=${port} url=${urlPath} rawLen=${raw.length} enc=${res.headers['content-encoding']}: ${err.message}`
                )
              );
            }
          });
          res.on('error', reject);
        }
      );
      req.on('error', reject);
      req.setTimeout(8000, () => reject(new Error(`getBytes timeout port=${port} url=${urlPath}`)));
    });
  }

  beforeAll(async () => {
    // Express probes use the ORIGINAL res.render; Fastify probes use the
    // helper. That asymmetry is the point: the helper must reproduce it.
    const stack = expressApp.router.stack;
    const insertAt = stack.length - 3;
    const appendedAt = stack.length;

    expressApp.get('/v1/__view_msg91', (req, res) => {
      res.render('other/msg91', { locals: MSG91_LOCALS });
    });
    expressApp.get('/v1/__view_firebase', (req, res) => {
      res.render('other/firebase', { locals: FIREBASE_LOCALS });
    });
    expressApp.get('/v1/__view_static', (req, res) => {
      res.render('other/success');
    });
    expressApp.get('/v1/__view_missing', (req, res) => {
      res.render('other/does_not_exist', { locals: {} });
    });

    stack.splice(insertAt, 0, ...stack.splice(appendedAt));

    fastify = await buildFastify();

    fastify.get('/v1/__view_msg91', async (request, reply) => {
      await renderView(request, reply, 'other/msg91', { locals: MSG91_LOCALS });
    });
    fastify.get('/v1/__view_firebase', async (request, reply) => {
      await renderView(request, reply, 'other/firebase', { locals: FIREBASE_LOCALS });
    });
    fastify.get('/v1/__view_static', async (request, reply) => {
      await renderView(request, reply, 'other/success');
    });
    fastify.get('/v1/__view_missing', async (request, reply) => {
      await renderView(request, reply, 'other/does_not_exist', { locals: {} });
    });

    await fastify.ready();
    eSrv = expressApp.listen(0);
    await new Promise((resolve) => eSrv.on('listening', resolve));
    ePort = eSrv.address().port;
    await fastify.listen({ port: 0 });
    fPort = fastify.server.address().port;
  }, 60000);

  afterAll(async () => {
    if (eSrv) {
      eSrv.closeAllConnections();
      await new Promise((resolve) => eSrv.close(resolve));
    }
    if (fastify) await fastify.close();
  });

  async function compare(url) {
    const [eRes, fRes] = await Promise.all([getBytes(ePort, url), getBytes(fPort, url)]);
    return {
      express: eRes,
      fastify: fRes,
    };
  }

  const assertParity = (label, result) => {
    const diffs = headerDiff(result.express.headers, result.fastify.headers);
    expect(diffs, `${label} header differences:\n${diffs.join('\n')}`).toEqual([]);
    expect(result.fastify.status, label).toBe(result.express.status);
    expect(result.fastify.text, `${label} body`).toBe(result.express.text);
  };

  it('msg91 with locals is byte-identical', async () => {
    const r = await compare('/v1/__view_msg91');
    assertParity('msg91', r);
    expect(r.express.status).toBe(200);
    expect(r.express.headers['content-type']).toBe('text/html; charset=utf-8');
    expect(r.express.text).toContain("widgetId: 'w123'");
    expect(r.express.text).not.toContain('${');
  });

  it('firebase with locals is byte-identical', async () => {
    const r = await compare('/v1/__view_firebase');
    assertParity('firebase', r);
    expect(r.express.text).toContain('pid');
  });

  it('static template with no locals is byte-identical', async () => {
    const r = await compare('/v1/__view_static');
    assertParity('static', r);
    expect(r.express.status).toBe(200);
  });

  it('missing template errors identically', async () => {
    const r = await compare('/v1/__view_missing');
    assertParity('missing view', r);
    expect(r.express.status).toBe(500);
  });
});
