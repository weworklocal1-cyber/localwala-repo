/* eslint-disable @typescript-eslint/no-require-imports */
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
 * Phase 2.9a: the Express reply/request surface, transplanted onto Fastify.
 *
 * The controllers that Phase 2.9 moves across are still Express-shaped:
 * `res.status(200).json(...)`, `res.setHeader(...)`, `res.redirect(303, url)`,
 * `res.cookie(...)`, `req.get('user-agent')`, `req.connection.remoteAddress`.
 * Fastify's reply has none of those (it has `code`, `header`, `redirect` with
 * the arguments the other way round, `setCookie`, and a request with no `get`).
 * Rather than rewrite ~1,900 route files and their controllers up front, this
 * module installs the Express names so a converted route behaves identically
 * to the Express route it replaced. Everything here is deleted in Phase 9,
 * when the controllers themselves are normalised.
 *
 * Every implementation below is a line-for-line port of Express, not a
 * re-derivation, and tests/replycompat.parity.test.js asserts both servers
 * produce byte-identical headers and bodies for each one.
 *
 * Three Express methods are deliberately NOT provided here, because their own
 * migration steps own them:
 *   - `res.download` / `res.end` - Phase 2.11 (they need `send`/`resumable`).
 *   - `res.render`               - Phase 2.11 (server-side view rendering).
 *   - `res.format`/`res.attachment` - unused (0 call sites in src/).
 */
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

const encodeUrl = require('encodeurl') as (url: string) => string;
const escapeHtml = require('escape-html') as (str: string) => string;
const varyLib = require('vary') as {
  append: (header: string, field: string) => string;
};
const acceptsLib = require('accepts') as (req: unknown) => {
  types: (types: string[]) => string | false;
};
const httpStatus = require('http-status').status as Record<string | number, string>;
const contentType = require('content-type') as {
  parse: (type: string) => { parameters: Record<string, string> };
  format: (obj: unknown) => string;
};
const etagFn = require('etag') as (
  body: string | Buffer,
  options?: { weak?: boolean }
) => string;

/**
 * Set by `redirect()` and read by the weak-ETag hook in src/fastify.ts.
 *
 * Express computes an ETag inside `res.send` only; `res.redirect` finishes
 * with `res.end`, so a redirected response carries no ETag at all.
 */
export const REPLY_NO_ETAG: unique symbol = Symbol('localwala.reply.noEtag');

/** True when `redirect()` has taken over this reply. */
export function skipsEtag(reply: FastifyReply): boolean {
  return flag(reply) === true;
}

function flag(reply: FastifyReply): boolean | undefined {
  return (reply as FastifyReply & { [REPLY_NO_ETAG]?: boolean })[REPLY_NO_ETAG];
}

function markNoEtag(reply: FastifyReply): void {
  (reply as FastifyReply & { [REPLY_NO_ETAG]?: boolean })[REPLY_NO_ETAG] = true;
}

/**
 * Express res.cookie's option bag. Kept loose on purpose: Express forwards
 * whatever it is given straight into `cookie.serialize`.
 */
interface CookieOptions {
  path?: string;
  domain?: string;
  expires?: Date;
  maxAge?: number;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: boolean | 'lax' | 'strict' | 'none';
  signed?: boolean;
  [key: string]: unknown;
}

type SetCookieOptions = NonNullable<Parameters<FastifyReply['setCookie']>[2]>;

/**
 * Fastify's own `send`, recovered from wherever it lives on the prototype
 * chain. `decorateReply` refuses to overwrite an own property, so the one it
 * just installed at the top of the chain cannot be the original - the walk
 * skips our own function and stops at Fastify's.
 */
let cachedOriginalSend: ((payload?: unknown) => FastifyReply) | undefined;

function expressSend(this: FastifyReply, payload?: unknown): FastifyReply {
  if (payload === null) {
    // Express's res.send(null) falls into its `case 'object'` branch, which
    // rewrites the body to '' and never serialises it. Reaching the
    // empty-payload path of Fastify's own send reproduces the absent
    // Content-Type and the Content-Length: 0; the ETag is pre-set because
    // Express computed one over the rewritten '' body.
    if (!this.getHeader('etag')) this.header('etag', etagFn('', { weak: true }));
    const nullType = this.getHeader('content-type');
    if (typeof nullType === 'string') {
      // The rewrite to the empty string still runs Express's string branch, so
      // a Content-Type the controller had already chosen gains its charset.
      this.header('content-type', setCharset(nullType, 'utf-8'));
      return originalSend(this).call(this, '');
    }
    return originalSend(this).call(this, undefined);
  }

  if (typeof payload === 'string') {
    const existing = this.getHeader('content-type');
    // express/lib/response.js: `case 'string': if (!this.get('Content-Type'))
    // this.type('html')`. Fastify would choose `text/plain; charset=utf-8` for
    // the same payload. Read the header rather than a flag, because this is
    // exactly the predicate Express uses and it therefore also preserves a
    // Content-Type the controller set for itself (the CSV exports do).
    if (existing === undefined) {
      this.header('content-type', 'text/html; charset=utf-8');
    } else if (typeof existing === 'string') {
      // ...and once a Content-Type exists, Express's string branch runs it
      // through setCharset - `res.setHeader('Content-Type', 'text/csv')` comes
      // back out of res.send as `text/csv; charset=utf-8`.
      this.header('content-type', setCharset(existing, 'utf-8'));
    }
  }

  return originalSend(this).call(this, payload);
}

/**
 * express/lib/utils.js:225, verbatim. `res.send(string)` feeds whatever
 * Content-Type is already on the response through this on its way out.
 */
function setCharset(type: string, charset: string): string {
  if (!type || !charset) return type;
  const parsed = contentType.parse(type);
  parsed.parameters.charset = charset;
  return contentType.format(parsed);
}

function originalSend(reply: FastifyReply): (payload?: unknown) => FastifyReply {
  if (cachedOriginalSend) return cachedOriginalSend;

  let proto: object | null = Object.getPrototypeOf(reply);
  while (proto) {
    const descriptor = Object.getOwnPropertyDescriptor(proto, 'send');
    if (descriptor && typeof descriptor.value === 'function' && descriptor.value !== expressSend) {
      cachedOriginalSend = descriptor.value as (payload?: unknown) => FastifyReply;
      return cachedOriginalSend;
    }
    proto = Object.getPrototypeOf(proto);
  }

  throw new Error('replyCompat: Fastify Reply.prototype.send was not found');
}

/**
 * express/lib/response.js res.json: set the Content-Type when the controller
 * has not, stringify, then hand the *string* to res.send. Stringifying here
 * rather than letting Fastify serialise keeps `res.json('hi')` quoted, keeps
 * `res.json(null)` an `null` body, and costs nothing extra - Fastify would
 * have run the same JSON.stringify anyway.
 */
function expressJson(this: FastifyReply, payload: unknown): FastifyReply {
  if (!this.getHeader('content-type')) {
    this.header('content-type', 'application/json; charset=utf-8');
  }
  const body = payload === undefined ? undefined : JSON.stringify(payload);
  return this.send(body);
}

/**
 * Node's ServerResponse.setHeader, which Express inherits. Fastify's
 * `reply.header` is the same operation (last write wins, except for
 * `set-cookie` which accumulates) and returns the reply for chaining.
 */
function expressSetHeader(
  this: FastifyReply,
  name: string,
  value: number | string | readonly string[]
): FastifyReply {
  this.header(name, value as unknown as string);
  return this;
}

/**
 * express/lib/response.js res.cookie, verbatim - including the two behaviours
 * @fastify/cookie gets wrong:
 *
 *   1. `maxAge` is milliseconds. Express converts it to `Max-Age` seconds and
 *      derives `Expires`; @fastify/cookie passes the raw number through, so a
 *      1-second cookie would live 1,000 seconds.
 *   2. Express defaults `path` to `/`; @fastify/cookie only uses `/` in its
 *      de-duplication key, so the serialized header carries no `Path` at all
 *      and browsers scope it to the request path instead of the whole site.
 *
 * `sameSite` is forwarded as an explicit `undefined` when the caller did not
 * ask for one: `Object.assign({ sameSite: 'lax' }, options)` inside
 * @fastify/cookie copies the own-property even when its value is undefined,
 * which is what stops it inventing `SameSite=Lax` for Express's callers.
 *
 * Not ported: `signed` (no call site passes it, and Express's signed-cookie
 * format differs from @fastify/cookie's anyway).
 */
function expressCookie(
  this: FastifyReply,
  name: string,
  value: unknown,
  options?: CookieOptions
): FastifyReply {
  const opts: CookieOptions = { ...options };

  const val =
    typeof value === 'object' ? `j:${JSON.stringify(value)}` : String(value);

  if (opts.maxAge != null) {
    const maxAge = Number(opts.maxAge);
    if (!Number.isNaN(maxAge)) {
      opts.expires = new Date(Date.now() + maxAge);
      opts.maxAge = Math.floor(maxAge / 1000);
    }
  }

  if (opts.path == null) opts.path = '/';

  return this.setCookie(name, String(val), {
    ...opts,
    sameSite: opts.sameSite,
  } as SetCookieOptions);
}

/**
 * express/lib/response.js res.clearCookie, verbatim: expire it in the past,
 * drop `maxAge` so no `Max-Age` attribute is emitted, and leave everything
 * else the caller passed through. @fastify/cookie's own clearCookie forces
 * `Max-Age=0` as well, which Express never sends.
 */
function expressClearCookie(
  this: FastifyReply,
  name: string,
  options?: CookieOptions
): FastifyReply {
  const opts: CookieOptions = { path: '/', ...options, expires: new Date(1) };
  delete opts.maxAge;
  return expressCookie.call(this, name, '', opts);
}

/**
 * express/lib/response.js res.redirect, verbatim - argument order, status
 * message, content negotiation, the `Vary: Accept` it always adds, and the
 * absence of an ETag.
 *
 * `res.format` is what makes redirects non-trivial: Express picks between
 * `text/html` and `text/plain` from the request's Accept header and only then
 * builds a body, so a browser gets an HTML message while a client asking for
 * `application/json` gets an empty body with no Content-Type at all.
 *
 * The `text`/`html` shorthands resolve through `mime.lookup` in
 * express/lib/utils.js:61 - `text` -> `text/plain`, `html` -> `text/html` -
 * and `res.set` appends `charset=utf-8` to both.
 */
function expressRedirect(
  this: FastifyReply,
  first: number | string,
  second?: string
): FastifyReply {
  let status = 302;
  let address: unknown = first;
  if (arguments.length === 2) {
    status = first as number;
    address = second;
  }

  const location = encodeUrl(String(address));
  this.header('location', location);

  const currentVary = this.getHeader('vary');
  this.header(
    'vary',
    varyLib.append(
      Array.isArray(currentVary) ? currentVary.join(', ') : String(currentVary ?? ''),
      'Accept'
    )
  );

  const accepted = acceptsLib(this.request.raw).types(['text', 'html']);

  let body = '';
  if (accepted === 'text') {
    this.header('content-type', 'text/plain; charset=utf-8');
    body = `${httpStatus[status]}. Redirecting to ${location}`;
  } else if (accepted === 'html') {
    this.header('content-type', 'text/html; charset=utf-8');
    body = `<p>${httpStatus[status]}. Redirecting to ${escapeHtml(location)}</p>`;
  }

  markNoEtag(this);
  this.code(status);

  // The no-match branch sends no payload at all: Fastify then emits
  // Content-Length: 0 and, crucially, no Content-Type - exactly what Express's
  // `res.end('')` produces once `res.format` has taken its `default` path.
  return body ? this.send(body) : this.send();
}

/**
 * express/lib/request.js req.get / req.header.
 */
function expressGet(this: FastifyRequest, name: string): string | string[] | undefined {
  if (!name) throw new TypeError('name argument is required to req.get');
  if (typeof name !== 'string') throw new TypeError('name must be a string to req.get');

  const lc = name.toLowerCase();
  switch (lc) {
    case 'referer':
    case 'referrer':
      return this.headers.referrer || this.headers.referer;
    default:
      return this.headers[lc];
  }
}

/**
 * Install the Express surface.
 *
 * `cookie` and `clearCookie` cannot go through `decorateReply`: @fastify/cookie
 * already owns both names on the same Reply prototype and Fastify throws
 * FST_ERR_DEC_ALREADY_PRESENT (node_modules/fastify/lib/decorate.js). They are
 * therefore written straight onto the prototype the first time a reply is
 * handed to a hook, which is still before any route handler can run.
 */
export function registerReplyCompat(app: FastifyInstance): void {
  app.decorateReply('send', expressSend);
  app.decorateReply('json', expressJson);
  app.decorateReply('setHeader', expressSetHeader);
  app.decorateReply('redirect', expressRedirect);

  app.decorateRequest('get', expressGet);

  // Express's `req.connection` is Node's alias for `req.socket`, which is what
  // makes `req.connection.remoteAddress` the *socket* address - deliberately
  // not `req.ip`, which honours `trust proxy`.
  app.decorateRequest('connection', {
    getter(this: FastifyRequest) {
      return this.raw.socket ?? this.raw.connection;
    },
  });

  // express/lib/request.js: `req.secure` is just `this.protocol === 'https'`.
  // `protocol` itself needs no shim - Fastify implements it natively with the
  // same trust-proxy semantics (request.js honours `x-forwarded-proto` from
  // trusted hops, configured identically in src/fastify.ts and src/app.js).
  app.decorateRequest('secure', {
    getter(this: FastifyRequest): boolean {
      return this.protocol === 'https';
    },
  });

  const patched = new WeakSet<object>();
  app.addHook('onRequest', async (_request, reply) => {
    const proto = Object.getPrototypeOf(reply);
    if (patched.has(proto)) return;
    patched.add(proto);
    proto.cookie = expressCookie;
    proto.clearCookie = expressClearCookie;
  });
}
