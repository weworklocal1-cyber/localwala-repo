/**
 * LocalWala – Local Commerce & Delivery Platform
 * (NodeJS, MongoDB, Angular & Flutter)
 *
 * Copyright © 2026 WeWorkLocal Private Limited
 * https://weworklocal.in/
 *
 * WeWorkLocal Private Limited
 * This source code is confidential.
 *
 * Ownership Fingerprint:
 * LWL|WWL|2026|LOCALWALA|NODE
 *
 * Phase 2.11: file downloads and xlsx streaming, one call, two frameworks.
 *
 * ---------------------------------------------------------------------------
 * Why this exists
 * ---------------------------------------------------------------------------
 * Export responses bypass `res.send` entirely: `res.download()` streams a
 * file with `send`'s caching headers, and `workbook.xlsx.write(res)` streams
 * a zip straight into the socket. Neither exists on Fastify's reply, so the
 * 220 sites call these helpers instead. CSV exports need nothing - they are
 * `res.setHeader` + `res.send(csv)`, which the 2.9a adapter already makes
 * byte-identical (including `text/csv; charset=utf-8` and the ETag).
 *
 * `sendFileDownload` mirrors `send`'s header rules line for line
 * (`send/index.js` `setHeader`: every header respects a pre-set value,
 * Content-Type falls back to `mime.contentType(ext)`), and `res.download`'s
 * rule that Content-Disposition always comes from the filename argument
 * (`contentDisposition(name || path)`, passed through send's options so it
 * overwrites whatever the controller pre-set). ETag, Last-Modified,
 * Accept-Ranges and Cache-Control are recomputed from `fs.stat`, exactly as
 * `send` does - and because both servers read the *same* file, the values
 * are identical, stat-etag included. The unlink-on-success callbacks stay in
 * the callers, untouched.
 *
 * `sendXlsx` streams through a `PassThrough` handed to `reply.send` rather
 * than hijacking the raw response, so helmet/cors/compress `onSend` hooks
 * still run (a hijack would silently drop every security header). `xlsx` is
 * not in the compressible database - checked against the same `compressible`
 * module both servers use - so both sides stream it chunked.
 */
const fs = require('node:fs');
const path = require('node:path');
const { PassThrough } = require('node:stream');
const contentDisposition = require('content-disposition');
const mime = require('mime-types');
const etagFn = require('etag');

/**
 * `res.download(path[, filename][, callback])` for either framework.
 *
 * Always await the return value. On Express the transfer owns the response
 * either way, but on Fastify an async handler that returns before `send`
 * makes Fastify answer an empty 200 first - the await keeps the handler
 * alive until the bytes are handed over. Resolution always follows the
 * callback (even on error, mirroring Express, where a swallowed sendfile
 * error leaves the request hanging rather than answering).
 */
function sendFileDownload(req, res, downloadPath, filename, callback) {
  if (typeof filename === 'function') {
    callback = filename;
    filename = undefined;
  }

  if (!req.raw) {
    // Express: res.download's own overloads, untouched.
    return new Promise((resolve) => {
      const done = (err) => {
        if (callback) callback(err);
        resolve();
      };
      if (filename === undefined) {
        if (callback) res.download(downloadPath, done);
        else res.download(downloadPath, done);
      } else if (callback) {
        res.download(downloadPath, filename, done);
      } else {
        res.download(downloadPath, filename, done);
      }
    });
  }

  // Fastify: Content-Disposition always comes from the filename, exactly as
  // res.download passes it through send's options (overwriting pre-set).
  res.setHeader('Content-Disposition', contentDisposition(filename || downloadPath));
  // Everything else respects a pre-set value, exactly as send does.
  if (!res.getHeader('content-type')) {
    res.setHeader('Content-Type', mime.contentType(path.extname(downloadPath)) || 'application/octet-stream');
  }
  return new Promise((resolve) => {
    const done = () => resolve();
    fs.stat(downloadPath, (statErr, stat) => {
      if (statErr) {
        if (callback) callback(statErr);
        done();
        return;
      }
      if (!res.getHeader('accept-ranges')) res.setHeader('Accept-Ranges', 'bytes');
      if (!res.getHeader('cache-control')) res.setHeader('Cache-Control', 'public, max-age=0');
      if (!res.getHeader('last-modified')) res.setHeader('Last-Modified', stat.mtime.toUTCString());
      if (!res.getHeader('etag')) res.setHeader('ETag', etagFn(stat));
      fs.readFile(downloadPath, (err, data) => {
        if (err) {
          if (callback) callback(err);
          done();
          return;
        }
        res.send(data);
        if (callback) callback(null);
        done();
      });
    });
  });
}

/**
 * `await workbook.xlsx.write(res); res.end();` for either framework.
 */
async function sendXlsx(workbook, req, res) {
  if (!req.raw) {
    await workbook.xlsx.write(res);
    res.end();
    return;
  }
  const stream = new PassThrough();
  res.send(stream);
  await workbook.xlsx.write(stream);
  stream.end();
}

module.exports = { sendFileDownload, sendXlsx };
