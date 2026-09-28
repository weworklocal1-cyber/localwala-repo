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
 * Phase 2.2-2.4: the Fastify application shell.
 *
 * Nothing here serves traffic yet - `src/app.js` is still the process entry.
 * This module exists so the server, its plugins and its error surface can be
 * built and *tested for parity* before a single route is moved over. Every
 * option below is chosen to reproduce Express's defaults, not Fastify's.
 */
import Fastify, {
  type FastifyInstance,
  type FastifyReply,
  type FastifyRequest,
  type RouteOptions,
} from 'fastify';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import formbody from '@fastify/formbody';
import compress from '@fastify/compress';
import fastifyStatic from '@fastify/static';
import mongoose from 'mongoose';
import fs from 'node:fs';
import path from 'node:path';

const config = require('./config/config');
const ApiError = require('./utils/ApiError');
const logger = require('./config/logger');
const httpStatus = require('http-status').status;
const etag = require('etag');
const fp = require('fastify-plugin');
const { buildHealthPage } = require('./utils/healthPage');

/** Express used `express.json({ limit: '5mb' })` + the same for urlencoded. */
const BODY_LIMIT = 5 * 1024 * 1024;

const isDevelopmentEnv = config.env !== 'production';

const isAllowedDevOrigin = (origin: string): boolean =>
  origin.startsWith('http://localhost') ||
  origin.startsWith('https://localhost') ||
  origin.startsWith('http://127.0.0.1') ||
  origin.startsWith('https://127.0.0.1') ||
  origin.startsWith('http://192.168.0.26') ||
  origin.startsWith('https://192.168.0.26');

/** Mirrors `OriginCallback` in @fastify/cors's type definitions. */
type CorsOriginType = string | boolean | RegExp;
type CorsCallback = (err: Error | null, origin: CorsOriginType | CorsOriginType[]) => void;

/**
 * Verbatim port of the corsOptions.origin callback in src/app.js.
 *
 * @fastify/cors propagates a non-null error to Fastify's error handler, which
 * is exactly what the `cors` package did with `next(err)` - both end up as the
 * 403 JSON body `errorHandler` produces.
 */
const corsOrigin = (origin: string | undefined, cb: CorsCallback): void => {
  if (!origin) {
    cb(null, true);
    return;
  }

  if (config.cors.origins.includes(origin) || (isDevelopmentEnv && isAllowedDevOrigin(origin))) {
    cb(null, true);
    return;
  }

  const err = new Error('Not allowed by CORS') as Error & { statusCode?: number };
  err.statusCode = 403;
  cb(err, false);
};

/**
 * Anything that can reach the error handler: an ApiError, a mongoose
 * ValidationError, or one of Fastify's own (which always carry statusCode).
 */
interface AppErrorShape extends Error {
  statusCode?: number;
  isOperational?: boolean;
  extra?: unknown;
}

/**
 * `src/middlewares/error.js` as a single function.
 *
 * Express ran errorConverter then errorHandler as two middlewares; Fastify
 * hands both steps the error and the reply, so the conversion happens inline.
 * The response body is reproduced field for field, including the
 * development-only `stack`.
 */
function renderError(err: AppErrorShape, request: FastifyRequest, reply: FastifyReply): FastifyReply {
  let error = err;
  if (!(error instanceof ApiError)) {
    const statusCode =
      error.statusCode ||
      (error instanceof mongoose.Error ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR);
    const message = error.message || httpStatus[statusCode];
    error = new ApiError(statusCode, message, false, err.stack);
  }

  let statusCode = Number(error.statusCode) || httpStatus.INTERNAL_SERVER_ERROR;
  let message = error.message || httpStatus[statusCode] || 'Internal Server Error';
  let extra = error.extra;
  if (config.env === 'production' && !error.isOperational) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = httpStatus[httpStatus.INTERNAL_SERVER_ERROR];
    extra = extra || '';
  }

  const body: Record<string, unknown> = {
    success: false,
    code: statusCode,
    message,
    extra,
  };
  if (config.env === 'development') {
    body.stack = error.stack;
    logger.error(error);
  }

  request.log.error({ err: error, statusCode }, 'request error');
  return reply.code(statusCode).send(body);
}

/**
 * Build the Fastify application.
 *
 * Registration order mirrors app.js so hooks land in the same sequence:
 * helmet -> header parity -> cors -> static -> body parsers -> cookie ->
 * compression.
 */
export async function buildFastify(): Promise<FastifyInstance> {
  const publicFolderPath = path.resolve(process.cwd(), config.folder.public);
  if (!fs.existsSync(publicFolderPath)) {
    fs.mkdirSync(publicFolderPath, { recursive: true });
  }

  const app = Fastify({
    logger:
      config.env === 'test'
        ? false
        : {
            level: config.env === 'development' ? 'info' : 'warn',
            transport: undefined,
          },

    // Express's `app.set('trust proxy', [...])` is only applied in production.
    trustProxy: config.env === 'production' ? ['loopback', 'linklocal', 'uniquelocal'] : false,

    // Express has strict routing disabled, so `/foo/` matches `/foo`, and
    // `case sensitive routing` disabled, so `/V1/Auth` matched `/v1/auth`.
    // Fastify defaults to the opposite on both counts. (Fastify 5.12 moved
    // these under `routerOptions`; the top-level form warns and dies in 6.)
    routerOptions: {
      ignoreTrailingSlash: true,
      caseSensitive: false,
    },

    // Query parser: Express 5's default is `simple` (Node's querystring), not
    // the `extended`/qs parser Express 4 used - Fastify's built-in default is
    // querystring too, so no override is needed. Pinned by
    // tests/fastify.parity.test.js.

    bodyLimit: BODY_LIMIT,
  });

  await app.register(helmet, {
    frameguard: { action: 'deny' },
    noSniff: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          'https://verify.msg91.com',
          'https://control.msg91.com',
          'https://js.hcaptcha.com',
          'https://cdnjs.cloudflare.com',
          'https://www.gstatic.com',
          'https://unpkg.com',
          'https://www.google.com',
          'https://www.recaptcha.net',
        ],
        scriptSrcAttr: ["'unsafe-inline'"],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          'https://fonts.googleapis.com',
          'https://cdnjs.cloudflare.com',
          'https://control.msg91.com',
        ],
        fontSrc: ["'self'", 'data:', 'https://fonts.gstatic.com'],
        connectSrc: [
          "'self'",
          'https://verify.msg91.com',
          'https://control.msg91.com',
          'https://api.db-ip.com',
          'https://hcaptcha.com',
          'https://*.hcaptcha.com',
          'https://www.googleapis.com',
          'https://securetoken.googleapis.com',
          'https://identitytoolkit.googleapis.com',
          'https://www.gstatic.com',
          'https://www.google.com',
        ],
        frameSrc: [
          "'self'",
          'https://hcaptcha.com',
          'https://*.hcaptcha.com',
          'https://www.google.com',
          'https://recaptcha.google.com',
          'https://www.gstatic.com',
        ],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        frameAncestors: ["'none'"],
        formAction: ["'self'"],
      },
    },
  });

  // app.js:130-135 - helmet 7+ sets `X-XSS-Protection: 0`, then Express
  // overwrites it. Reproduce the final values rather than helmet's defaults.
  app.addHook('onRequest', async (_request, reply) => {
    reply.header('X-Frame-Options', 'DENY');
    reply.header('X-Content-Type-Options', 'nosniff');
    reply.header('X-XSS-Protection', '1; mode=block');
  });

  await app.register(cors, {
    origin: corsOrigin,
    credentials: true,
  });

  await app.register(fastifyStatic, {
    root: publicFolderPath,
    prefix: '/storage/',
    index: ['index.html'],
  });

  // express.json({ limit: '5mb' }) + express.urlencoded({ extended: true })
  await app.register(formbody, { bodyLimit: BODY_LIMIT });

  await app.register(cookie, {});

  // Express sets a weak ETag on every res.send (and on error bodies) via the
  // `etag` package, so the value is `W/"<length-hex>-<sha1>"`. Hashing here
  // rather than with @fastify/etag keeps it byte-identical for an identical
  // body, which matters while traffic can land on either server. Anything
  // that already carries an ETag (express.static / @fastify/static) is left
  // alone.
  //
  // Wrapped in fastify-plugin so the hook stays global, and registered
  // before @fastify/compress so the uncompressed entity is hashed, exactly as
  // Express does.
  await app.register(
    fp(async (instance: FastifyInstance) => {
      instance.addHook(
        'onSend',
        async (_request: FastifyRequest, reply: FastifyReply, payload: unknown) => {
          if (payload === null || payload === undefined) return payload;
          if (reply.getHeader('etag')) return payload;
          if (typeof payload !== 'string' && !Buffer.isBuffer(payload)) return payload;
          reply.header('etag', etag(payload, { weak: true }));
          return payload;
        }
      );
    })
  );

  await app.register(compress, {
    global: true,
    threshold: 1024,
  });

  // Express's compression middleware emits `Vary: Accept-Encoding` in title
  // case; @fastify/compress echoes the request's own spelling. Vary tokens are
  // case-insensitive, so no client can tell, but keeping the bytes identical
  // makes the parity gate strict instead of quietly lenient.
  //
  // This has to be a *route* hook: @fastify/compress injects its own via
  // `onRoute` and those run after every instance-level onSend, so an instance
  // hook registered afterwards would still be too early. Registering after
  // @fastify/compress appends ours to the end of each route's chain.
  //
  // `content-length` is deliberately not normalised: Fastify recomputes it for
  // buffered payloads after hooks run, so Express's chunked encoding cannot be
  // reproduced from here. It is excluded in tests/fastify.parity.test.js.
  app.addHook('onRoute', (routeOptions: RouteOptions) => {
    const existing = routeOptions.onSend;
    const chain = existing ? (Array.isArray(existing) ? existing : [existing]) : [];
    routeOptions.onSend = [
      ...chain,
      async (_request, reply, payload) => {
        const vary = reply.getHeader('vary');
        if (typeof vary === 'string' && vary.length) {
          reply.header(
            'vary',
            vary
              .split(',')
              .map((token) => token.trim())
              .filter(Boolean)
              .map((token) =>
                token.toLowerCase() === 'accept-encoding' ? 'Accept-Encoding' : token
              )
              .join(', ')
          );
        }
        return payload;
      },
    ];
  });

  // GET / - the one route both servers own during the strangler migration.
  app.get('/', async (_request, reply) =>
    reply.type('text/html; charset=utf-8').send(buildHealthPage())
  );

  app.setNotFoundHandler((request, reply) =>
    renderError(new ApiError(httpStatus.NOT_FOUND, 'Not found'), request, reply)
  );

  app.setErrorHandler((err, request, reply) =>
    renderError(err as AppErrorShape, request, reply)
  );

  return app;
}
