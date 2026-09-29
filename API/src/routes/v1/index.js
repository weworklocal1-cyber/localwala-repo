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

const { expressRegistrar, fastifyRegistrar } = require('../routeRegistrar');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const adminRoute = require('./admin.route');
const fileRoute = require('./file.route');
const driverRoute = require('./driver.route');
const publicRoute = require('./public.route');
const vendorRoute = require('./vendor.route');
const vendorWebRoute = require('./vendor_web.route');
const waiterRoute = require('./waiter.route');
const accontantRoute = require('./accountant.route');
const supportTeamRoute = require('./support.team.route');
const cityZenRoute = require('./cityzen.route');
const kitchenRoute = require('./kitchen.route');

// Phase 2.16: `express` is required lazily inside getExpressRouter() below, so
// a production boot (which only calls registerOnFastify) never loads it.


const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/admin',
    route: adminRoute,
  },
  {
    path: '/vendor',
    route: vendorRoute,
  },
  {
    path: '/vendor_web',
    route: vendorWebRoute,
  },
  {
    path: '/driver',
    route: driverRoute,
  },
  {
    path: '/file',
    route: fileRoute,
  },
  {
    path: '/public',
    route: publicRoute,
  },
  {
    path: '/waiter',
    route: waiterRoute,
  },
  {
    path: '/accountant',
    route: accontantRoute,
  },
  {
    path: '/support_team',
    route: supportTeamRoute,
  },
  {
    path: '/cityzen',
    route: cityZenRoute,
  },
  {
    path: '/kitchen',
    route: kitchenRoute,
  },
];

/**
 * A converted route module exports `{ register }` (Phase 2.9); one that has
 * not been converted yet still exports an `express.Router`. Both are mounted
 * the same way, so a single file can move across without the rest moving.
 */
function isConverted(routeModule) {
  return Boolean(routeModule) && typeof routeModule.register === 'function';
}

/**
 * Phase 2.16: built on first access rather than at require time.
 *
 * The Express tree is the *parity baseline* - production (src/index.js ->
 * src/fastify.ts) only ever calls `registerOnFastify`, so building it here
 * meant loading `express` on every production boot for nothing. Making it lazy
 * means `require('express')` only happens when someone actually destructures
 * `router`, i.e. from src/app.js (the Express app) and
 * tools/route-manifest.js (the Express manifest).
 *
 * Verified by tests/production-graph.test.js, which walks the real require
 * graph from src/index.js and asserts express is unreachable.
 */
let cachedExpressRouter = null;

function getExpressRouter() {
  if (cachedExpressRouter) return cachedExpressRouter;

  const express = require('express');
  const built = express.Router();

  defaultRoutes.forEach((entry) => {
    if (isConverted(entry.route)) {
      const subRouter = express.Router();
      entry.route.register(expressRegistrar(subRouter));
      built.use(entry.path, subRouter);
      return;
    }
    built.use(entry.path, entry.route);
  });

  cachedExpressRouter = built;
  return built;
}

/**
 * Phase 2.9 - replay the converted declarations onto Fastify, with the mount
 * baked into the URL (`/file` -> `/v1/file/uploadImage`). Unconverted files
 * are skipped: they are only reachable through Express until their own step.
 *
 * `createAuth` is injected from src/auth/fastifyAuth.ts rather than required
 * here, because this file is CommonJS and is loaded on the Express boot path
 * in production, where a `.ts` module cannot be resolved.
 */
function registerOnFastify(app, createAuth) {
  defaultRoutes.forEach((entry) => {
    if (!isConverted(entry.route)) return;
    entry.route.register(fastifyRegistrar(app, `/v1${entry.path}`, createAuth));
  });
}

module.exports = {
  // Getter, not a value: builds the Express tree (and requires express) on
  // first access only. See getExpressRouter().
  get router() {
    return getExpressRouter();
  },
  registerOnFastify,
};
