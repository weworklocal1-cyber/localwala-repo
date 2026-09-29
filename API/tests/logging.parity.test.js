/**
 * Phase 2.14 gate: Fastify access logs match morgan's, line for line.
 *
 * `src/plugins/requestLog.ts` writes morgan's shape (`:method :url :status -
 * :response-time ms`, production `:remote-addr` prefix, `- message: …`
 * suffix on errors) into the same winston logger. The unit tests pin the
 * format function directly, including the production prefix and the
 * always-present-but-possibly-empty error suffix. The integration tests fire
 * real requests at both servers with winston's `info`/`error` stubbed and
 * compare the captured lines modulo response time (each server times
 * itself).
 *
 * Both morgan (finish listener) and the `onResponse` hook can fire after the
 * test client has its response, so assertions poll rather than read
 * immediately.
 *
 * No MongoDB: `/` and the 404 handler need none.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import express from 'express';
import request from 'supertest';
import { createRequire } from 'node:module';

const require_ = createRequire(import.meta.url);

const morgan = require_('../src/config/morgan');
const { errorConverter, errorHandler } = require_('../src/middlewares/error');
const ApiError = require_('../src/utils/ApiError');
const { formatRequestLog } = await import('../src/plugins/requestLog');

const { buildFastify } = await import('../src/fastify');

describe('Phase 2.14 - access log parity', () => {
  let fastify;
  let morganApp;
  let lines;
  let originalInfo;
  let originalError;

  // Winston is stubbed at the method level: the TS side shares this file's
  // module instance (proven by experiment), so both servers' loggers are the
  // same object this file holds.
  async function waitForLines(kind, since, count, what) {
    const deadline = Date.now() + 5000;
    for (;;) {
      if (lines[kind].length >= since + count) return lines[kind].slice(since, since + count);
      if (Date.now() > deadline) {
        throw new Error(`timed out waiting for ${what}: got ${JSON.stringify(lines)}`);
      }
      await new Promise((resolve) => setTimeout(resolve, 25));
    }
  }

  beforeAll(async () => {
    lines = { info: [], error: [] };
    const logger = require_('../src/config/logger');
    originalInfo = logger.info;
    originalError = logger.error;
    logger.info = (message) => {
      lines.info.push(String(message));
    };
    logger.error = (message) => {
      lines.error.push(String(message));
    };

    // The main app disables morgan in test env, so the Express baseline is a
    // mini-app mounting the REAL morgan handlers and the REAL error pipeline.
    morganApp = express();
    morganApp.use(morgan.successHandler);
    morganApp.use(morgan.errorHandler);
    morganApp.get('/', (req, res) => res.send('ok'));
    morganApp.use((req, res, next) => next(new ApiError(404, 'Not found')));
    morganApp.use(errorConverter);
    morganApp.use(errorHandler);

    fastify = await buildFastify();
    await fastify.ready();
  }, 60000);

  afterAll(async () => {
    const logger = require_('../src/config/logger');
    logger.info = originalInfo;
    logger.error = originalError;
    if (fastify) await fastify.close();
  });

  it('formats success lines like morgan', () => {
    expect(
      formatRequestLog({
        ip: '1.2.3.4',
        method: 'GET',
        url: '/v1/x?a=1',
        status: 200,
        ms: 2.53344,
        production: false,
      })
    ).toEqual({ line: 'GET /v1/x?a=1 200 - 2.533 ms', isError: false });
  });

  it('formats error lines with the message suffix, empty when unset', () => {
    expect(
      formatRequestLog({
        ip: '1.2.3.4',
        method: 'GET',
        url: '/v1/x?a=1',
        status: 404,
        ms: 1.2,
        message: 'Not found',
        production: true,
      })
    ).toEqual({
      line: '1.2.3.4 - GET /v1/x?a=1 404 - 1.200 ms - message: Not found',
      isError: true,
    });
    expect(
      formatRequestLog({
        ip: '1.2.3.4',
        method: 'POST',
        url: '/v1/auth/login',
        status: 429,
        ms: 0.5,
        production: false,
      })
    ).toEqual({
      line: 'POST /v1/auth/login 429 - 0.500 ms - message: ',
      isError: true,
    });
  });

  const normalize = (line) => String(line).replace(/\d+\.\d{3} ms/, 'X ms');

  it('success responses log identical info lines on both servers', async () => {
    const sinceInfo = lines.info.length;
    const sinceError = lines.error.length;

    const eRes = await request(morganApp).get('/?a=1&b=2');
    const fRes = await fastify.inject({ method: 'GET', url: '/?a=1&b=2' });
    expect(eRes.status).toBe(200);
    expect(fRes.statusCode).toBe(200);

    const got = await waitForLines('info', sinceInfo, 2, 'both info lines');
    expect(got).toHaveLength(2);
    for (const line of got) expect(normalize(line)).toBe('GET /?a=1&b=2 200 - X ms');
    expect(lines.error.length).toBe(sinceError);
  });

  it('error responses log identical error lines carrying the message', async () => {
    const sinceInfo = lines.info.length;
    const sinceError = lines.error.length;

    const eRes = await request(morganApp).get('/v1/nope');
    const fRes = await fastify.inject({ method: 'GET', url: '/v1/nope' });
    expect(eRes.status).toBe(404);
    expect(fRes.statusCode).toBe(404);

    const got = await waitForLines('error', sinceError, 2, 'both error lines');
    expect(got).toHaveLength(2);
    for (const line of got) {
      expect(normalize(line)).toBe('GET /v1/nope 404 - X ms - message: Not found');
    }
    expect(lines.info.length).toBe(sinceInfo);
  });
});
