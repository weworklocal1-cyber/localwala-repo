/**
 * Global Express type augmentation.
 *
 * Type-only: emits nothing at runtime, so it cannot change behaviour of the
 * running monolith. It exists so the first TypeScript route/controller ported
 * during the strangler migration gets `req.user` instead of `any`.
 */

import type { AuthUser } from './auth';

declare global {
  namespace Express {
    interface Request {
      /**
       * Set by `src/middlewares/auth.factory.js` on every protected route.
       * Absent on public routes.
       */
      user?: AuthUser;
    }
  }
}

export {};
