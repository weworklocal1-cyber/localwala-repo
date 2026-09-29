/**
 * Phase 2.11 gate: exports and downloads are byte-identical on both servers.
 *
 * Three shapes, three treatments:
 *
 *   - CSV (`res.setHeader` + `res.send`) needs no helper - the 2.9a adapter
 *     already makes it identical, ETag included. Pinned here so it cannot
 *     regress silently.
 *   - `res.download` (110 sites) now goes through `sendFileDownload`, which
 *     mirrors `send`'s header rules: Content-Disposition always comes from
 *     the filename argument (overwriting pre-set, exactly as `res.download`
 *     passes it through send's options), everything else respects pre-set,
 *     and ETag/Last-Modified/Accept-Ranges/Cache-Control are recomputed
 *     from `fs.stat` exactly as `send` does. Both servers read the *same*
 *     file, so even the stat-etag matches - the whole header block is
 *     compared, not just the body.
 *   - `workbook.xlsx.write(res)` + `res.end()` (110 sites) now goes through
 *     `sendXlsx`, which streams through a `PassThrough` handed to
 *     `reply.send` so every `onSend` hook (helmet, cors, vary) still runs.
 *     xlsx embeds timestamps, so bodies are compared by length plus parsed
 *     sheet values rather than raw bytes - over real HTTP, because
 *     `inject` utf8-mangles binary bodies (a test-harness loss, not a
 *     server difference; proven during the spike).
 *
 * No MongoDB: every probe serves synthetic content.
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

const { sendFileDownload, sendXlsx } = require_('../src/utils/download');
const fs = require_('node:fs');
const path = require_('node:path');
const http = require_('node:http');
const ExcelJS = require_('exceljs');

const expressApp = (await import('../src/app')).default;
const { buildFastify } = await import('../src/fastify');

const TMP_DIR = 'C:\\Users\\WEWORK~1\\AppData\\Local\\Temp\\opencode';
const TMP_JSON = `${TMP_DIR}\\dl-parity.json`;

/** Transport headers that legitimately differ; everything else is compared. */
const IGNORED_HEADERS = new Set(['date', 'connection', 'keep-alive']);

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

function buildWorkbook() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'parity';
  workbook.created = new Date(0);
  workbook.modified = new Date(0);
  const ws = workbook.addWorksheet('Users');
  ws.columns = [
    { header: 'Name', key: 'name' },
    { header: 'Status', key: 'status' },
  ];
  ws.addRow({ name: 'Ada', status: 'Active' });
  ws.addRow({ name: 'Bob', status: 'Deactivated' });
  return workbook;
}

async function sheetValues(buffer) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const ws = workbook.getWorksheet('Users');
  const rows = [];
  ws.eachRow((row) => rows.push(row.values.slice(1)));
  return { rows, rowCount: ws.rowCount };
}

describe('Phase 2.11 - download and export parity', () => {
  let fastify;

  beforeAll(async () => {
    fs.writeFileSync(TMP_JSON, JSON.stringify({ hello: 'world', n: 42 }, null, 2));

    // Express probes use the ORIGINAL calls; Fastify probes use the helpers.
    // That asymmetry is the point: the helpers must reproduce res.download.
    const stack = expressApp.router.stack;
    const insertAt = stack.length - 3;
    const appendedAt = stack.length;

    expressApp.get('/v1/__dl_preset', (req, res) => {
      res.setHeader('Content-Disposition', 'attachment; filename=export.json');
      res.setHeader('Content-Type', 'application/json');
      res.download(TMP_JSON, 'cities.json', (err) => {
        if (!err) {
          /* probe file is stable - no unlink */
        }
      });
    });
    expressApp.get('/v1/__dl_bare', (req, res) => {
      res.download(TMP_JSON, (err) => {
        if (err) res.status(500).end();
      });
    });
    expressApp.get('/v1/__dl_csv', (req, res) => {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
      res.send('a,b\n1,2');
    });
    expressApp.get('/v1/__dl_xlsx', async (req, res) => {
      const workbook = buildWorkbook();
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader('Content-Disposition', 'attachment; filename=users.xlsx');
      await workbook.xlsx.write(res);
      res.end();
    });

    stack.splice(insertAt, 0, ...stack.splice(appendedAt));

    fastify = await buildFastify();

    fastify.get('/v1/__dl_preset', async (_req, reply) => {
      reply.setHeader('Content-Disposition', 'attachment; filename=export.json');
      reply.setHeader('Content-Type', 'application/json');
      await sendFileDownload(_req, reply, TMP_JSON, 'cities.json', () => {});
    });
    fastify.get('/v1/__dl_bare', async (_req, reply) => {
      await sendFileDownload(_req, reply, TMP_JSON, (err) => {
        if (err) reply.status(500).send('');
      });
    });
    fastify.get('/v1/__dl_csv', async (_req, reply) => {
      reply.setHeader('Content-Type', 'text/csv');
      reply.setHeader('Content-Disposition', 'attachment; filename=users.csv');
      return reply.send('a,b\n1,2');
    });
    fastify.get('/v1/__dl_xlsx', async (_req, reply) => {
      const workbook = buildWorkbook();
      reply.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      reply.setHeader('Content-Disposition', 'attachment; filename=users.xlsx');
      await sendXlsx(workbook, _req, reply);
    });

    await fastify.ready();
  }, 60000);

  afterAll(async () => {
    if (fastify) await fastify.close();
  });

  async function compareText(url) {
    const eRes = await request(expressApp).get(url);
    const fRes = await fastify.inject({ method: 'GET', url });
    return {
      express: { status: eRes.status, headers: eRes.headers, text: eRes.text },
      fastify: { status: fRes.statusCode, headers: fRes.headers, text: fRes.body },
    };
  }

  const assertParity = (label, result) => {
    const diffs = headerDiff(result.express.headers, result.fastify.headers);
    expect(diffs, `${label} header differences:\n${diffs.join('\n')}`).toEqual([]);
    expect(result.fastify.status, label).toBe(result.express.status);
    expect(result.fastify.text, `${label} body`).toBe(result.express.text);
  };

  it('download with pre-set headers matches, filename argument wins', async () => {
    const r = await compareText('/v1/__dl_preset');
    assertParity('preset download', r);
    expect(r.express.status).toBe(200);
    // res.download overwrites the pre-set disposition with its own filename:
    expect(r.express.headers['content-disposition']).toBe('attachment; filename="cities.json"');
    // ...including the stat-etag both servers recompute from the same file:
    expect(r.express.headers.etag).toMatch(/^W\//);
    expect(r.express.headers['last-modified']).toBeDefined();
    expect(r.express.headers['accept-ranges']).toBe('bytes');
  });

  it('bare download derives disposition and content-type identically', async () => {
    const r = await compareText('/v1/__dl_bare');
    assertParity('bare download', r);
    expect(r.express.headers['content-disposition']).toBe('attachment; filename="dl-parity.json"');
    expect(r.express.headers['content-type']).toBe('application/json; charset=utf-8');
  });

  it('CSV via res.send stays byte-identical with no helper', async () => {
    const r = await compareText('/v1/__dl_csv');
    assertParity('csv', r);
    expect(r.express.headers['content-type']).toBe('text/csv; charset=utf-8');
  });

  it('xlsx streams identical headers, length and sheet values', async () => {
    async function getBytes(port, urlPath) {
      return new Promise((resolve, reject) => {
        http.get({ port, path: urlPath }, (res) => {
          const chunks = [];
          res.on('data', (c) => chunks.push(c));
          res.on('end', () =>
            resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks) })
          );
          res.on('error', reject);
        });
      });
    }

    const eSrv = expressApp.listen(0);
    await new Promise((resolve) => eSrv.on('listening', resolve));
    await fastify.listen({ port: 0 });
    try {
      const eX = await getBytes(eSrv.address().port, '/v1/__dl_xlsx');
      const fX = await getBytes(fastify.server.address().port, '/v1/__dl_xlsx');

      expect(fX.status).toBe(eX.status);
      const diffs = headerDiff(eX.headers, fX.headers);
      expect(diffs, `xlsx header differences:\n${diffs.join('\n')}`).toEqual([]);
      expect(fX.body.length).toBe(eX.body.length);

      const eVals = await sheetValues(eX.body);
      const fVals = await sheetValues(fX.body);
      expect(fVals).toEqual(eVals);
      expect(eVals.rows).toEqual([
        ['Name', 'Status'],
        ['Ada', 'Active'],
        ['Bob', 'Deactivated'],
      ]);
    } finally {
      eSrv.close();
    }
  });
});
