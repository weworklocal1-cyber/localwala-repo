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
 * Phase 2.7: `express-rate-limit` -> `@fastify/rate-limit`, scoped exactly the
 * way `src/app.js` scopes it (`app.use('/v1/auth', authLimiter)`, production
 * only, 20 requests per 15 minutes, `skipSuccessfulRequests: true`).
 *
 * Four gaps between the two libraries have to be closed by hand. Each one is
 * a place where a "close enough" port would silently change behaviour:
 *
 *  1. **`skipSuccessfulRequests` has no equivalent.** express-rate-limit
 *     increments on arrival and decrements on `finish` when the status is
 *     < 400, so a client that logs in successfully never consumes budget and
 *     only *failed* attempts are throttled. Without this the limiter would
 *     lock out legitimate users after 20 successful logins in 15 minutes.
 *     `@fastify/rate-limit`'s store has no `decrement`, so the store below is
 *     a port of express-rate-limit's own `MemoryStore` and we decrement from
 *     an `onResponse` hook.
 *
 *  2. **`X-RateLimit-Reset` means different things.** express-rate-limit
 *     sends the *absolute* window end (`Math.ceil(resetTime / 1000)`),
 *     `@fastify/rate-limit` sends the *remaining* seconds. An API client
 *     parsing it would compute the wrong retry time. The value is rewritten
 *     from our store's `resetTime` on the way out.
 *
 *  3. **The 429 body differs.** express-rate-limit responds with a bare
 *     `text/html` string, `@fastify/rate-limit` throws an Error that Fastify's
 *     error handler renders as JSON. `renderError()` in `src/fastify.ts`
 *     recognises `RateLimitError` and reproduces Express's response.
 *
 *  4. **Scope.** Express mounts the limiter by path prefix; Fastify has no
 *     prefix-scoped limiter. An `onRoute` hook attaches the config to every
 *     route whose url starts with `/v1/auth`, which is the same set - and,
 *     unlike a global limiter, it leaves every other route with no
 *     rate-limit headers at all, exactly as Express does.
 *
 * Known, accepted deviations (both unreachable in the parity suite and
 * documented in the plan doc):
 *   - Express counts requests that end up 404 under `/v1/auth`, because
 *     `app.use` runs before routing. Fastify attaches per-route, so a 404
 *     under `/v1/auth` is not counted.
 *   - The limiter runs at `preValidation` (after body parsing) so a malformed
 *     body wins over the limit, matching Express. Requests rejected *before*
 *     `preValidation` are not counted on either side.
 */
import type { FastifyInstance, FastifyRequest, RouteOptions } from 'fastify';
import rateLimit from '@fastify/rate-limit';

const config = require('../config/config');
const { normalizeIP } = require('@fastify/rate-limit');

/** Verbatim default of `express-rate-limit` - `authLimiter` does not override it. */
export const RATE_LIMIT_MESSAGE = 'Too many requests, please try again later.';

/** `windowMs: 15 * 60 * 1000`, `max: 20`, from src/middlewares/rateLimiter.js. */
export const AUTH_RATE_LIMIT = {
  timeWindow: 15 * 60 * 1000,
  max: 20,
} as const;

/** Marks the error `errorResponseBuilder` throws so `renderError` can special-case it. */
export class RateLimitError extends Error {
  statusCode = 429;
  readonly rateLimitExceeded = true;

  constructor() {
    super(RATE_LIMIT_MESSAGE);
    this.name = 'RateLimitError';
  }
}

/** Per-request key of the counter the limiter incremented, set by `onExceeding`. */
export const kRateLimitKey = Symbol('localwala.rateLimitKey');

interface Client {
  totalHits: number;
  resetTime: Date;
}

/**
 * Port of express-rate-limit's `MemoryStore` (`dist/index.cjs` L46-199).
 *
 * Same fixed window, same two-map recycling, same `decrement` semantics
 * (`if (totalHits > 0) totalHits--`). The periodic `clearExpired` sweep is
 * dropped: it is only bulk GC - counting already checks `resetTime` on every
 * `increment`, so behaviour is identical and there is no interval to leak.
 */
class ExpressMemoryStore {
  private readonly previous = new Map<string, Client>();
  private readonly current = new Map<string, Client>();

  /** @fastify/rate-limit calls this once per configured route. */
  child(): this {
    return this;
  }

  incr(
    key: string,
    callback: (error: Error | null, result?: { current: number; ttl: number }) => void,
    timeWindow: number
  ): void {
    const client = this.clientFor(key);
    const now = Date.now();
    if (client.resetTime.getTime() <= now) {
      client.totalHits = 0;
      client.resetTime.setTime(now + timeWindow);
    }
    client.totalHits += 1;
    callback(null, {
      current: client.totalHits,
      ttl: Math.max(0, client.resetTime.getTime() - now),
    });
  }

  /** Used by our `onResponse` hook; not part of @fastify/rate-limit's interface. */
  decrement(key: string): void {
    const client = this.current.get(key) ?? this.previous.get(key);
    if (client && client.totalHits > 0) client.totalHits -= 1;
  }

  /** Absolute window end for `X-RateLimit-Reset`, or null if never counted. */
  resetTimeOf(key: string): Date | null {
    return this.current.get(key)?.resetTime ?? this.previous.get(key)?.resetTime ?? null;
  }

  private clientFor(key: string): Client {
    const existing = this.current.get(key);
    if (existing) return existing;

    const carried = this.previous.get(key);
    if (carried) {
      this.previous.delete(key);
      this.current.set(key, carried);
      return carried;
    }

    const created: Client = { totalHits: 0, resetTime: new Date() };
    created.resetTime.setTime(Date.now() + AUTH_RATE_LIMIT.timeWindow);
    this.current.set(key, created);
    return created;
  }
}

/**
 * Singleton handed to `@fastify/rate-limit` as its `store` constructor.
 *
 * `new Store(params)` is expected to return the store; a constructor that
 * returns an object overrides `this`, so this returns the shared instance and
 * the plugin's `.child()` (which returns `this`) resolves back to it too. That
 * is what lets `onResponse` decrement the exact counter the plugin incremented.
 */
export const authRateLimitStore = new ExpressMemoryStore();
const storeConstructor = function storeConstructor(): ExpressMemoryStore {
  return authRateLimitStore;
} as unknown as { new (options: unknown): ExpressMemoryStore };

/** Same key `@fastify/rate-limit` derives: `normalizeIP(request.ip)` (default subnet). */
export function rateLimitKey(request: FastifyRequest): string {
  return normalizeIP(request.ip) as string;
}

/** `app.use('/v1/auth', authLimiter)` - Express matches on whole path segments. */
const AUTH_MOUNT_PATTERN = /^\/v1\/auth(\/|$)/;

export async function registerAuthRateLimit(app: FastifyInstance): Promise<void> {
  if (config.env !== 'production') return; // mirrors the `if` in src/app.js

  // Must be added BEFORE the plugin is registered: @fastify/rate-limit reads
  // `routeOptions.config.rateLimit` from its own `onRoute` hook, and hooks
  // fire in the order they were added.
  app.addHook('onRoute', (routeOptions: RouteOptions) => {
    if (!AUTH_MOUNT_PATTERN.test(routeOptions.url ?? '')) return;
    routeOptions.config = { ...routeOptions.config, rateLimit: { ...AUTH_RATE_LIMIT } };
  });

  await app.register(rateLimit, {
    global: false,
    store: storeConstructor,

    // Express's `app.use` runs after `express.json`, so a body the parser
    // rejects wins over the limit. `preValidation` is the Fastify equivalent;
    // the plugin's default (`onRequest`) would answer 429 first.
    hook: 'preValidation',

    addHeaders: {
      'x-ratelimit-limit': true,
      'x-ratelimit-remaining': true,
      'x-ratelimit-reset': true,
      'retry-after': true,
    },

    // Record which counter this request touched, so `onResponse` decrements
    // the right key. Only runs when the limiter actually counted the request,
    // so a request rejected before `preValidation` never decrements.
    onExceeding: (request: FastifyRequest, key: string) => {
      (request as { [kRateLimitKey]?: string })[kRateLimitKey] = key;
    },

    // Express's `message` option, returned as a thrown Error so it reaches
    // Fastify's error handler (that is how @fastify/rate-limit signals it).
    errorResponseBuilder: () => new RateLimitError(),
  });

  // skipSuccessfulRequests: express-rate-limit decrements on `finish` whenever
  // the status is < 400. `onResponse` runs after the bytes are on the wire,
  // which is the closest equivalent to `finish`.
  app.addHook('onResponse', async (request, reply) => {
    const key = (request as { [kRateLimitKey]?: string })[kRateLimitKey];
    if (!key) return;
    delete (request as { [kRateLimitKey]?: string })[kRateLimitKey];
    if (reply.statusCode < 400) authRateLimitStore.decrement(key);
  });

  // @fastify/rate-limit writes the *remaining* seconds into
  // `x-ratelimit-reset`; express-rate-limit writes the absolute epoch second.
  // Rewrite it from the store so an API client reading it gets the same
  // number from either server.
  app.addHook('onSend', async (request, reply, payload) => {
    if (reply.getHeader('x-ratelimit-reset') === undefined) return payload;
    const resetTime = authRateLimitStore.resetTimeOf(rateLimitKey(request));
    if (resetTime) {
      reply.header('x-ratelimit-reset', String(Math.ceil(resetTime.getTime() / 1000)));
    }
    return payload;
  });
}
