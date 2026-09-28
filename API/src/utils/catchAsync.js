/**
 * LocalWala – Local Commerce & Delivery Platform
 * (NodeJS, MongoDB, Angular & Flutter)
 *
 * Copyright © 2026 WeWorkLocal Private Limited
 * https://weworklocal.in/
 *
 * WeWorkLocal Private Limited
 *
 * This source code is confidential.
 * Unauthorized copying, redistribution, resale, publication,
 * modification, or use of this source code in any public or
 * commercial repository is strictly prohibited.
 *
 * Ownership Fingerprint:
 * LWL|WWL|2026|LOCALWALA|NODE
 */

/**
 * Identity wrapper.
 *
 * This used to be a `Promise.resolve(fn(...)).catch(next)` shim, but Express 5
 * already forwards a rejected returned promise to the error middleware and so
 * does Fastify, so the wrapper only existed to paper over Express 4. Keeping
 * it as identity means every one of the ~1,477 wrapped handlers is already
 * shaped the way the Fastify port needs: `(request, reply) => Promise`.
 *
 * See tests/express.promise.test.js, which pins this behaviour.
 */
const catchAsync = (fn) => fn;

module.exports = catchAsync;

