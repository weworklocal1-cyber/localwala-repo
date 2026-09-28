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

const express = require('express');
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

const router = express.Router();

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

defaultRoutes.forEach((entry) => {
  if (isConverted(entry.route)) {
    const subRouter = express.Router();
    entry.route.register(expressRegistrar(subRouter));
    router.use(entry.path, subRouter);
    return;
  }
  router.use(entry.path, entry.route);
});

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

module.exports = { router, registerOnFastify };
