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
 * Phase 2.9: one route declaration, two frameworks.
 *
 * ---------------------------------------------------------------------------
 * Why this exists
 * ---------------------------------------------------------------------------
 * `src/index.js` still boots Express (`http.createServer(app)`) and will not
 * switch to Fastify until Phase 2.15, yet Phase 2.9 rewrites the route files
 * to Fastify's own `route({ method, url, preHandler, handler })` shape. Those
 * two facts only coexist if a converted route file can register on *both*
 * servers at once - which is what this module provides.
 *
 *   Express  : src/routes/v1/index.js builds the same `express.Router` tree it
 *              has always built, so `tools/route-manifest.js` sees byte
 *              identical layers and `manifest:check` stays at 0/0/0.
 *   Fastify  : src/fastify.ts calls `registerOnFastify`, which replays the
 *              same declarations onto the Fastify instance with `/v1/<mount>`
 *              baked into the URL.
 *
 * A converted route file exports `{ register }` - a function that is invoked
 * once per framework, so the declarations are re-evaluated rather than shared.
 * Files that have not been converted yet still export an `express.Router` and
 * are mounted exactly as before, which is what makes the conversion strictly
 * one file at a time.
 *
 * This module is deleted in Phase 9, along with the Express branch.
 */

/**
 * Express branch.
 *
 * `route({...})` becomes `router.get(url, ...preHandler, handler)` - the same
 * layer Express has always received, in the same order, so the route manifest
 * (which reads `handler.isAuth` / `handler.isValidate` off each argument)
 * reproduces the Phase 0 baseline exactly.
 */
function expressRegistrar(router) {
  return function route(definition) {
    const method = String(definition.method).toLowerCase();
    router[method](definition.url, ...(definition.preHandler || []), definition.handler);
  };
}

/**
 * Fastify branch.
 *
 * @param app      the Fastify instance (or a scoped encapsulation context)
 * @param prefix   absolute mount, e.g. `/v1/file`
 * @param createAuth `(strategy) => (...requiredRights) => handler`, injected
 *                   from src/auth/fastifyAuth.ts because this file is plain
 *                   CommonJS and must never `require` a `.ts` module on the
 *                   Express boot path.
 */
function fastifyRegistrar(app, prefix, createAuth) {
  const mount = String(prefix || '').replace(/\/+$/, '');

  return function route(definition) {
    const url = definition.url === '/' ? mount || '/' : mount + definition.url;

    app.route({
      method: String(definition.method).toUpperCase(),
      url,
      preHandler: (definition.preHandler || []).map((hook) => toFastifyHook(hook, createAuth)),
      handler: definition.handler,
    });
  };
}

/**
 * Translate one Express route middleware into a Fastify `preHandler`.
 *
 * Three cases, and they cover every middleware the route files use:
 *
 *   1. `appAuth('right')` / `webAuth('right')` - created by
 *      `src/middlewares/auth.factory.js`, which stamps `isAuth`, `authStrategy`
 *      and `requiredRights` onto the middleware for exactly this purpose. The
 *      Express one closes over passport, which cannot run on Fastify's route
 *      surface, so it is rebuilt with `createFastifyAuth(strategy)`. The two
 *      are held byte-identical by tests/auth.parity.test.js.
 *      Conversion is deliberately idempotent: a handler that is already
 *      Fastify-shaped carries the same three tags, so re-running it produces
 *      the same handler rather than a passport closure inside a Fastify hook.
 *
 *   2. `validate(schema)` - tagged `isValidate`. Reused untouched: Fastify
 *      invokes callback-style hooks as `(request, reply, done)`, which is the
 *      same position Express gives `(req, res, next)` (Phase 2.5 spike).
 *
 *   3. Anything else is passed through and must already be Fastify-safe. All
 *      async hooks with arity 3 are rejected by Fastify at boot
 *      (`FST_ERR_HOOK_INVALID_ASYNC_HANDLER`), so a mistake here fails loudly
 *      rather than silently double-calling `next`.
 *
 * Order is preserved: Fastify runs `preHandler` entries in array order, which
 * is the order Express ran them in, so `appAuth` still precedes `validate`.
 */
function toFastifyHook(middleware, createAuth) {
  if (typeof middleware !== 'function') return middleware;

  if (middleware.isAuth === true) {
    const create = createAuth(middleware.authStrategy);
    return create(...(middleware.requiredRights || []));
  }

  return middleware;
}

module.exports = { expressRegistrar, fastifyRegistrar, toFastifyHook };
