/**
 * Global Fastify type augmentation.
 *
 * Type-only: emits nothing at runtime, so it cannot change the behaviour of
 * the running monolith. Two things are declared here:
 *
 *  1. `request.user` - supplied by `@fastify/jwt`'s own `FastifyRequest`
 *     augmentation, re-typed to the same `AuthUser` the Express side uses so
 *     controllers read identically whichever server is serving them.
 *  2. The `appAuth`/`webAuth` decorators installed by `buildFastify()`, which
 *     mirror `src/middlewares/appAuth.js` and `webAuth.js` one-for-one.
 */
import type { AuthUser } from './auth';
import type { FastifyAuthHandler } from '../auth/fastifyAuth';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    /**
     * Set by `src/auth/fastifyAuth.ts` after the user document is loaded;
     * absent on public routes. Declared optional because @fastify/jwt types it
     * as always-present, which would be a lie for unauthenticated requests.
     */
    user: AuthUser | undefined;
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    appAuth: (...requiredRights: string[]) => FastifyAuthHandler;
    webAuth: (...requiredRights: string[]) => FastifyAuthHandler;
  }

  interface FastifyReply {
    /** Phase 2.9a - src/plugins/replyCompat.ts, mirroring `res.json`. */
    json(payload: unknown): FastifyReply;
    /** Phase 2.9a - Node's `res.setHeader`, which Express inherits. */
    setHeader(name: string, value: number | string | readonly string[]): FastifyReply;
    /** Phase 2.9a - Express's argument order; Fastify's own is `(url, code)`. */
    redirect(statusCode: number, url: string): FastifyReply;
  }

  interface FastifyRequest {
    /** Phase 2.9a - `express/lib/request.js` `req.get`/`req.header`. */
    get(name: string): string | string[] | undefined;
    /** Phase 2.9a - Node's alias for `req.socket`, not the proxy-aware `req.ip`. */
    readonly connection: import('node:net').Socket;
  }
}
