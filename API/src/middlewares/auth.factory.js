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

// Phase 2.16: `passport` is required lazily, inside the middleware body.
//
// The 13 route files import `middlewares/appAuth` / `webAuth` at module load
// so they can build their route tables, and production loads all 13. Passport
// is only ever used when the Express middleware actually *runs* - on Fastify
// the registrar rebuilds each of these as a @fastify/jwt handler
// (createFastifyAuth), so passport was being loaded and never used. Resolving
// it at call time keeps the Express path identical while taking passport out
// of the production boot. Verified by tests/production-graph.test.js.
let passportModule = null;
const getPassport = () => {
  if (!passportModule) passportModule = require('passport');
  return passportModule;
};

const { status: httpStatus } = require('http-status');
const ApiError = require('../utils/ApiError');
const { roleRights } = require('../config/roles');

const verifyCallback = (req, resolve, reject, requiredRights) => async (err, user, info) => {
  if (err || info || !user) {
    return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
  }

  req.user = user;

  if (requiredRights.length) {
    const userRights = roleRights.get(user.role) || [];
    const hasRequiredRights = requiredRights.every((requiredRight) => userRights.includes(requiredRight));

    if (!hasRequiredRights && req.params.userId !== user.id) {
      return reject(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
    }
  }

  return resolve();
};

const createAuthMiddleware = (strategyName) => {
  return (...requiredRights) => {
    const middleware = async (req, res, next) => {
      return new Promise((resolve, reject) => {
        getPassport().authenticate(
          strategyName,
          { session: false },
          verifyCallback(req, resolve, reject, requiredRights)
        )(req, res, next);
      })
        .then(() => next())
        .catch((err) => next(err));
    };

    // Metadata for tooling (route manifest, Fastify preHandler mapping).
    // Does not affect runtime behaviour.
    middleware.isAuth = true;
    middleware.authStrategy = strategyName;
    middleware.requiredRights = requiredRights;

    return middleware;
  };
};

module.exports = {
  createAuthMiddleware,
};
