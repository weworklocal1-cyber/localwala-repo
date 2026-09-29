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
 * Phase 2.14: request access logs on Fastify, byte-identical to morgan's.
 *
 * ---------------------------------------------------------------------------
 * Why this exists
 * ---------------------------------------------------------------------------
 * `src/config/morgan.js` logs one line per request into the winston pipeline
 * (`logs/<date>/app.log` in production): `:method :url :status -
 * :response-time ms`, prefixed with `:remote-addr - ` in production and
 * suffixed with `- message: <res.locals.errorMessage>` on errors. Fastify's
 * built-in pino request lines (`incoming request` / `request completed`)
 * serve the same purpose in a different format to a different sink, so both
 * are disabled (`disableRequestLogging`) and this `onResponse` hook writes
 * the morgan shape into the *same* winston logger instead. Nothing downstream
 * of the log files can tell the servers apart.
 *
 * `res.locals.errorMessage` has no Fastify counterpart, so `renderError` in
 * src/fastify.ts stashes the final message on the request (same symbol
 * pattern as REPLY_NO_ETAG in plugins/replyCompat.ts) and the hook reads it
 * back. The stash happens on the main error path only: the 429 branch
 * returns before it, matching Express, where the rate limiter answers
 * directly and `res.locals.errorMessage` stays unset (empty suffix).
 */
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

const logger = require('../config/logger');
const config = require('../config/config');

/** Set by `renderError`, read by the `onResponse` hook below. */
const REQUEST_ERROR_MESSAGE: unique symbol = Symbol('localwala.request.errorMessage');

export function setRequestErrorMessage(request: FastifyRequest, message: string): void {
  (request as FastifyRequest & { [REQUEST_ERROR_MESSAGE]?: string })[REQUEST_ERROR_MESSAGE] =
    message;
}

function getRequestErrorMessage(request: FastifyRequest): string | undefined {
  return (request as FastifyRequest & { [REQUEST_ERROR_MESSAGE]?: string })[REQUEST_ERROR_MESSAGE];
}

export interface AccessLogFields {
  ip: string;
  method: string;
  url: string;
  status: number;
  /** Milliseconds; rendered with 3 decimals like morgan's :response-time. */
  ms: number;
  /** Appended as `- message: …` on error lines only. */
  message?: string;
  production: boolean;
}

/**
 * The two formats in src/config/morgan.js, as a pure function so tests can
 * pin them without booting a server.
 */
export function formatRequestLog(fields: AccessLogFields): { line: string; isError: boolean } {
  const prefix = fields.production ? `${fields.ip} - ` : '';
  const base = `${prefix}${fields.method} ${fields.url} ${fields.status} - ${fields.ms.toFixed(3)} ms`;
  if (fields.status >= 400) {
    // Morgan always appends the suffix on error lines, empty when unset.
    return { line: `${base} - message: ${fields.message || ''}`, isError: true };
  }
  return { line: base, isError: false };
}

export function registerRequestLog(app: FastifyInstance): void {
  app.addHook('onResponse', async (request: FastifyRequest, reply: FastifyReply) => {
    const { line, isError } = formatRequestLog({
      ip: request.ip,
      method: request.method,
      url: request.originalUrl,
      status: reply.statusCode,
      ms: reply.elapsedTime,
      message: getRequestErrorMessage(request),
      production: config.env === 'production',
    });
    if (isError) logger.error(line);
    else logger.info(line);
  });
}
