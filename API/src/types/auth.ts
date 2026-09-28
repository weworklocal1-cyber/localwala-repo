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
 */

import type { RequestHandler, Request } from 'express';

/**
 * The two JWT channels. `jwt-web` is sent as an `access_token` cookie by the
 * Angular admin and the vendor_web console; `jwt-app` is a `Bearer` token
 * sent by the five Flutter apps.
 */
export type AuthStrategy = 'jwt-web' | 'jwt-app';

/**
 * Shape of `req.user` after the auth middleware runs. In the monolith this is
 * a full mongoose User document; only the fields controllers actually read
 * are declared here.
 */
export interface AuthUser {
  id: string;
  role: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  mobile?: string;
  countryCode?: number;
  status?: boolean;
  locale?: string;
}

/**
 * Metadata attached to every auth middleware by
 * `src/middlewares/auth.factory.js`. It is deliberately non-enumerable-free
 * plain properties: the route manifest tool and the Fastify preHandler
 * mapping both read them, so they must survive a handover of the handler.
 */
export interface AuthMeta {
  isAuth: true;
  authStrategy: AuthStrategy;
  requiredRights: readonly string[];
}

/** A protected Express handler plus the metadata the router reads. */
export type AuthedHandler = RequestHandler & AuthMeta;

/**
 * Helper so the rights check inside a controller reads the same way it does
 * in `auth.factory.js` - the monolith otherwise resolves the acting user from
 * `req.body.userId` supplied by the client, which must not change during the
 * strangler migration.
 */
export function currentUser(req: Request): AuthUser | undefined {
  return req.user as AuthUser | undefined;
}
