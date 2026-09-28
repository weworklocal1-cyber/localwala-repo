/* eslint-disable @typescript-eslint/no-require-imports */
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
 *
 * Phase 2.6: the Fastify-native counterpart of `src/middlewares/auth.factory.js`.
 *
 * ---------------------------------------------------------------------------
 * Why two implementations exist (temporary, until Phase 2.9)
 * ---------------------------------------------------------------------------
 * The migration plan calls for Passport to be replaced by @fastify/jwt, but
 * the 1,766 `appAuth(...)`/`webAuth(...)` call sites are still Express routes
 * until Phase 2.9 converts them, and Passport cannot run on Fastify's *route*
 * surface in any useful way. So during Phase 2.6-2.8 both stacks are live:
 *
 *   Express  -> src/middlewares/auth.factory.js  (passport + passport-jwt)
 *   Fastify  -> src/auth/fastifyAuth.ts          (@fastify/jwt)   <-- this file
 *
 * The two are held byte-identical by `tests/auth.parity.test.js`, which fires
 * the same request at both servers and diffs status + body across the full
 * matrix (missing/expired/forged/refresh/orphan tokens, both strategies, both
 * error codes, the self-escape rule). When Phase 2.9 moves the last route over,
 * `auth.factory.js`, `config/passport.js` and the `passport*` dependencies are
 * deleted in one commit and this module becomes the only path.
 *
 * Nothing here may diverge from the Passport behaviour without that test being
 * updated in the same commit - it is the only thing standing between the
 * migration and a silent auth regression on ~1,766 routes.
 * ---------------------------------------------------------------------------
 */
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { AuthMeta, AuthStrategy } from '../types/auth';

const config = require('../config/config');
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status').status;
const { roleRights } = require('../config/roles');
const { tokenTypes } = require('../config/tokens');
const User = require('../models/user.model');

/**
 * Copied verbatim from passport-jwt's bundled `lib/auth_header.js`. Keeping the
 * exact expression matters: it stops at the second non-space token, so
 * `Authorization: Bearer <jwt> trailing` extracts only `<jwt>`.
 */
const AUTH_HEADER_RE = /(\S+)\s+(\S+)/;

/** A Fastify preHandler carrying the metadata the route manifest reads. */
export type FastifyAuthHandler = ((
  request: FastifyRequest,
  reply: FastifyReply
) => Promise<void>) &
  AuthMeta;

/**
 * Mirrors `cookieExtractor` in `src/config/passport.js` for `jwt-web` and
 * passport-jwt's `fromAuthHeaderAsBearerToken` for `jwt-app`.
 */
function extractToken(request: FastifyRequest, strategy: AuthStrategy): string | null {
  if (strategy === 'jwt-web') {
    const cookies = request.cookies as Record<string, string | undefined> | undefined;
    return cookies?.[config.jwt.cookieName] ?? null;
  }

  const header = request.headers.authorization;
  if (typeof header !== 'string') return null;

  const matches = header.match(AUTH_HEADER_RE);
  if (!matches || matches[1].toLowerCase() !== 'bearer') return null;
  return matches[2];
}

/**
 * Same shape as `createAuthMiddleware`: calling `appAuth('read')` returns a
 * handler that can be dropped straight into a route's `preHandler`.
 */
export function createFastifyAuth(strategy: AuthStrategy) {
  return (...requiredRights: string[]): FastifyAuthHandler => {
    const handler = async (request: FastifyRequest, _reply: FastifyReply): Promise<void> => {
      const token = extractToken(request, strategy);

      let payload: { sub?: unknown; type?: unknown };
      try {
        if (!token) throw new Error('missing token');
        payload = request.server.jwt.verify(token) as { sub?: unknown; type?: unknown };
      } catch {
        // Any extraction or verification failure - malformed, expired, wrong
        // signature, wrong algorithm - is indistinguishable from "not logged
        // in", exactly as passport-jwt funnels them all into `done(null,false)`.
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
      }

      if (payload.type !== tokenTypes.ACCESS) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
      }

      const user = await User.findById(payload.sub);
      if (!user) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
      }

      request.user = user;

      if (requiredRights.length) {
        const userRights: string[] = roleRights.get(user.role) || [];
        const hasRequiredRights = requiredRights.every((requiredRight) =>
          userRights.includes(requiredRight)
        );

        // `request.params` is `unknown` on an unparameterised FastifyRequest;
        // cast rather than narrow the handler's signature, so this stays
        // assignable to Fastify's `preHandlerHookHandler` for any route.
        const params = request.params as Record<string, string | undefined>;

        // Same self-ownership escape hatch the Express middleware has: a user
        // may always act on its own `:userId` even without the required right.
        if (!hasRequiredRights && params.userId !== user.id) {
          throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
        }
      }
    };

    const authed = handler as FastifyAuthHandler;
    // Same metadata contract as auth.factory.js - the route manifest tool and
    // the Phase 2.9 route conversion both read these.
    authed.isAuth = true;
    authed.authStrategy = strategy;
    authed.requiredRights = requiredRights;

    return authed;
  };
}

/** Bearer token from the five Flutter apps (`jwt-app`). */
export const appAuth = createFastifyAuth('jwt-app');

/** `access_token` cookie from the Angular admin and vendor_web (`jwt-web`). */
export const webAuth = createFastifyAuth('jwt-web');
