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
 * Phase 2.13: server-rendered views, one call, two frameworks.
 *
 * ---------------------------------------------------------------------------
 * Why this exists
 * ---------------------------------------------------------------------------
 * Thirteen responses render HTML templates (`other/msg91`, `other/firebase`,
 * `other/firebase_test` with `${}` variables; `success`/`failed`/`repeated`
 * static) through `express-es6-template-engine`. `res.render` does not exist
 * on Fastify, and the plan's `@fastify/view` would swap the engine - a second
 * substitution implementation to hold byte-identical against the first.
 * Instead both servers run the *same* `es6Renderer` function: Express through
 * `res.render` (untouched), Fastify by calling it directly and sending the
 * string, which the 2.9a adapter types `text/html; charset=utf-8` exactly as
 * Express's `res.send` does.
 *
 * Two engine quirks handled here, both read off its source:
 *   - Without a callback the engine crashes on missing files (`render(err)`
 *     with `render` undefined) instead of erroring, so the Fastify branch
 *     always passes one - matching Express, which always does.
 *   - With a callback the engine *also* rejects the promise it returns, so
 *     that rejection is swallowed; otherwise every missing template logs an
 *     unhandled rejection alongside the real error response.
 * `options.settings` is only read for partials, which no template uses, so
 * passing `{ locals }` alone is complete.
 *
 * Always await the return value (same empty-200 race as 2.10/2.11).
 */
const fs = require('node:fs');
const path = require('node:path');
const es6Renderer = require('express-es6-template-engine');

const viewsDir = path.join(__dirname, '..', 'templates');
// Express reports a missing view with the views directory spelled exactly as
// app.js builds it (`${__dirname}/templates/`), forward slashes included -
// the string below must stay byte-identical to that for the 500 bodies to
// match.
const viewsDirMessage = `${path.join(__dirname, '..')}/templates/`;

/**
 * `res.render(view[, options])` for either framework. `options` keeps its
 * Express shape (`{ locals: {...} }`); the Fastify branch unwraps it.
 */
function renderView(req, res, view, options) {
  if (!req.raw) {
    // Express: today's call, untouched.
    res.render(view, options);
    return Promise.resolve();
  }

  const locals = (options && options.locals) || {};
  const filePath = path.join(viewsDir, `${view}.html`);
  // Express resolves the view before invoking the engine and fails with its
  // own lookup error; the engine alone would report a bare ENOENT instead.
  if (!fs.existsSync(filePath)) {
    throw new Error(`Failed to lookup view "${view}" in views directory "${viewsDirMessage}"`);
  }
  return new Promise((resolve, reject) => {
    let settled = false;
    const done = (err, html) => {
      if (settled) return;
      settled = true;
      if (err) {
        reject(err);
        return;
      }
      res.send(html);
      resolve();
    };
    try {
      const maybePromise = es6Renderer(filePath, { locals }, done);
      if (maybePromise && typeof maybePromise.catch === 'function') {
        maybePromise.catch(() => {});
      }
    } catch (err) {
      done(err);
    }
  });
}

module.exports = renderView;
