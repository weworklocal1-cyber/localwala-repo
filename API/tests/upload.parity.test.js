/**
 * Phase 2.10 gate: uploads behave identically on both servers.
 *
 * All 78 upload sites now call `src/utils/handleUpload.js`, which runs the
 * *same* multer instance `src/middlewares/upload.js` builds: on Express over
 * the live request, on Fastify over a replay of the bytes the multipart
 * content parser in `src/fastify.ts` stashed. The probe cases below pin that
 * down to byte equality (memory storage), plus the disk-storage shape minus
 * its random filename (with the written files removed afterwards), plus two
 * requests against a real converted route (`POST /v1/file/uploadImage`)
 * proving Fastify no longer 415s multipart and still authenticates first.
 *
 * No MongoDB: probes never touch the database; the real route dies at auth.
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

const handleUpload = require_('../src/utils/handleUpload');
const fs = require_('node:fs');

const expressApp = (await import('../src/app')).default;
const { buildFastify } = await import('../src/fastify');

const BOUNDARY = 'parityboundary99';
const CT = `multipart/form-data; boundary=${BOUNDARY}`;

function part(headers, body) {
  return Buffer.concat([
    Buffer.from(`--${BOUNDARY}\r\n${headers}\r\n\r\n`, 'utf8'),
    body,
    Buffer.from('\r\n', 'utf8'),
  ]);
}
const end = () => Buffer.from(`--${BOUNDARY}--\r\n`, 'utf8');
const pngBytes = () =>
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3, 4]);

const goodBody = () =>
  Buffer.concat([
    part('Content-Disposition: form-data; name="uid"', Buffer.from('123', 'utf8')),
    part(
      'Content-Disposition: form-data; name="file"; filename="x.png"\r\nContent-Type: image/png',
      pngBytes()
    ),
    end(),
  ]);
const badTypeBody = () =>
  Buffer.concat([
    part(
      'Content-Disposition: form-data; name="file"; filename="x.exe"\r\nContent-Type: application/x-msdownload',
      Buffer.from([1, 2, 3])
    ),
    end(),
  ]);
const noFileBody = () =>
  Buffer.concat([
    part('Content-Disposition: form-data; name="uid"', Buffer.from('123', 'utf8')),
    end(),
  ]);
const bigBody = () =>
  Buffer.concat([
    part(
      'Content-Disposition: form-data; name="file"; filename="big.png"\r\nContent-Type: image/png',
      Buffer.alloc(2 * 1024 * 1024, 7)
    ),
    end(),
  ]);

/** Random-free projection of a multer file object. */
function shapeOf(file) {
  if (!file) return null;
  return {
    fieldname: file.fieldname,
    originalname: file.originalname,
    encoding: file.encoding,
    mimetype: file.mimetype,
    size: file.size,
    buffer: file.buffer ? file.buffer.toString('base64') : null,
    destination: file.destination ?? null,
    filenameExt: file.filename ? file.filename.slice(file.filename.lastIndexOf('.')) : null,
    hasPath: typeof file.path === 'string',
  };
}

function echoOf(err, file, body) {
  return {
    err: err ? { name: err.name, code: err.code, message: err.message } : null,
    file: shapeOf(file),
    body,
    diskPath: file && typeof file.path === 'string' ? file.path : null,
  };
}

describe('Phase 2.10 - handleUpload parity', () => {
  let fastify;

  beforeAll(async () => {
    // Express probes: spliced ahead of app.js's catch-all, like every other
    // parity suite in this repo.
    const stack = expressApp.router.stack;
    const insertAt = stack.length - 3;
    const appendedAt = stack.length;

    expressApp.post('/v1/__up_probe', async (req, res) => {
      await handleUpload(req, res, 'file', 'probe-memory', (err) => {
        res.json(echoOf(err, req.file, req.body));
      });
    });
    expressApp.post('/v1/__up_disk', async (req, res) => {
      await handleUpload(req, res, 'file', 'local', (err) => {
        res.json(echoOf(err, req.file, req.body));
      });
    });

    stack.splice(insertAt, 0, ...stack.splice(appendedAt));

    fastify = await buildFastify();

    fastify.post('/v1/__up_probe', async (request, reply) => {
      await handleUpload(request, reply, 'file', 'probe-memory', (err) => {
        reply.json(echoOf(err, request.file, request.body));
      });
    });
    fastify.post('/v1/__up_disk', async (request, reply) => {
      await handleUpload(request, reply, 'file', 'local', (err) => {
        reply.json(echoOf(err, request.file, request.body));
      });
    });

    await fastify.ready();
  }, 60000);

  afterAll(async () => {
    if (fastify) await fastify.close();
  });

  async function compare(url, payload) {
    const eRes = await request(expressApp).post(url).set('Content-Type', CT).send(payload);
    const fRes = await fastify.inject({
      method: 'POST',
      url,
      headers: { 'content-type': CT },
      payload,
    });
    return { express: eRes.body, fastify: fRes.json(), status: fRes.statusCode };
  }

  function unlinkDiskPaths(...echoes) {
    for (const echo of echoes) {
      if (echo && echo.diskPath) {
        try {
          fs.unlinkSync(echo.diskPath);
        } catch {
          /* already gone - never fail the test on cleanup */
        }
      }
    }
  }

  it('memory upload with fields + file is byte-identical', async () => {
    const r = await compare('/v1/__up_probe', goodBody());
    expect(r.status).toBe(200);
    expect(r.fastify).toEqual(r.express);
    expect(r.express.file.size).toBe(12);
    expect(r.express.body).toEqual({ uid: '123' });
  });

  it('fileFilter rejection is byte-identical', async () => {
    const r = await compare('/v1/__up_probe', badTypeBody());
    expect(r.fastify).toEqual(r.express);
    expect(r.express.err.message).toContain('Only png');
  });

  it('missing file is byte-identical', async () => {
    const r = await compare('/v1/__up_probe', noFileBody());
    expect(r.fastify).toEqual(r.express);
    expect(r.express.file).toBeNull();
  });

  it('oversize file is the same MulterError', async () => {
    const r = await compare('/v1/__up_probe', bigBody());
    expect(r.fastify).toEqual(r.express);
    expect(r.express.err).toMatchObject({ name: 'MulterError', code: 'LIMIT_FILE_SIZE' });
  });

  it('disk upload has the same shape (random filename excluded)', async () => {
    const r = await compare('/v1/__up_disk', goodBody());
    try {
      expect(r.status).toBe(200);
      expect(r.fastify.err).toEqual(r.express.err);
      expect(r.fastify.file).toEqual(r.express.file);
      expect(r.fastify.body).toEqual(r.express.body);
      expect(r.express.file.filenameExt).toBe('.png');
      expect(r.express.file.hasPath).toBe(true);
    } finally {
      unlinkDiskPaths(r.express, r.fastify);
    }
  });

  it('real route accepts multipart on Fastify and still authenticates first', async () => {
    const eRes = await request(expressApp)
      .post('/v1/file/uploadImage')
      .set('Content-Type', CT)
      .send(goodBody());
    const fRes = await fastify.inject({
      method: 'POST',
      url: '/v1/file/uploadImage',
      headers: { 'content-type': CT },
      payload: goodBody(),
    });
    expect(fRes.statusCode).toBe(eRes.status);
    expect(fRes.body).toBe(eRes.text);
    expect(eRes.status).toBe(401);
  });
});
