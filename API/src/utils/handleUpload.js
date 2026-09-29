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
 * Phase 2.10: one upload call, two frameworks.
 *
 * ---------------------------------------------------------------------------
 * Why this exists
 * ---------------------------------------------------------------------------
 * All 78 upload sites call `upload.single(field)(req, res, cb)` *inside* the
 * controller, after `validate()`. That works on Express because multer reads
 * the live request stream. On Fastify it cannot: Fastify has already routed
 * the body through its content parsers by the time the controller runs, and
 * the `FastifyRequest` is not the stream multer needs.
 *
 * So the multipart body is buffered once, up front, by the content parser in
 * `src/fastify.ts` (which yields `undefined` as `request.body`, because that
 * is what Express hands `validate()` - `express.json()` skips multipart and
 * leaves `req.body` undefined), and this helper replays those exact bytes
 * through the *same* multer instance `src/middlewares/upload.js` builds:
 * same disk/memory storage, same `fileFilter`, same `limits`, same
 * `MulterError` class. The replay runs over a `Readable` wearing the real
 * headers, and the outcome is mirrored where controllers read it
 * (`req.file`, `req.body`) - including multer's `Object.create(null)` body.
 *
 * Deliberately NOT a new package: `@fastify/multer` does not exist, and the
 * community `fastify-multer` (abandoned, Fastify 3 era) reimplements multer
 * with its own error class, which would break every controller's
 * `err instanceof multer.MulterError` check. Reusing multer is what makes the
 * file objects byte-identical by construction.
 *
 * The callback signature is kept on purpose. Each of the 78 sites maps errors
 * differently inside its own callback (`LIMIT_FILE_SIZE` wording,
 * `if (!err)` shapes); flattening them into promises is the Phase 2.12
 * controller rewrite's job. This helper changes one line per site.
 */

const { Readable } = require('node:stream');
const { Buffer } = require('node:buffer');
const uploadMiddleware = require('../middlewares/upload');

/**
 * Run multer's `.single(field)` for either framework.
 *
 * Always await the return value. The upload callback usually answers the
 * request itself, and on Fastify an async handler that returns first makes
 * Fastify answer an empty 200 - the await keeps the handler alive until the
 * callback (which may itself be async) settles. Event-deferred responses
 * inside callbacks (GCS/Azure/S3 stream `finish` handlers) still need the
 * Phase 2.12 controller flattening; everything awaited in the callback is
 * covered here.
 *
 * @param {object} req Express req or Fastify request
 * @param {object} res Express res or Fastify reply (only read on Express)
 * @param {string} field form field name (`file` or `fileName`)
 * @param {string} storageType `'local'` for disk, anything else for memory
 * @param {(err: Error | null) => unknown} callback invoked exactly as multer would
 * @returns {Promise<void>} settles after the callback settles
 */
function handleUpload(req, res, field, storageType, callback) {
  const upload = uploadMiddleware(storageType);

  if (!req.raw) {
    // Express: the call the 78 sites have always made, untouched.
    return new Promise((resolve, reject) => {
      upload.single(field)(req, res, (err) => {
        Promise.resolve(callback(err)).then(resolve, reject);
      });
    });
  }

  // Fastify: multer skips non-multipart requests without touching anything
  // (`make-middleware.js`: `if (!is(req, ['multipart'])) return next()`), so
  // a JSON/form post to an upload route keeps its parsed body here too.
  const contentType = req.headers && req.headers['content-type'];
  if (typeof contentType !== 'string' || !contentType.startsWith('multipart/')) {
    return Promise.resolve().then(() => callback(null));
  }

  const replay = Readable.from([req.raw.stashedMultipart || Buffer.alloc(0)]);
  replay.headers = req.headers;
  return new Promise((resolve, reject) => {
    upload.single(field)(replay, {}, (err) => {
      req.file = replay.file;
      req.body = replay.body;
      Promise.resolve(callback(err)).then(resolve, reject);
    });
  });
}

module.exports = handleUpload;
