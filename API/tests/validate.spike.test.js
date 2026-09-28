/**
 * Phase 2.5 spike: can `middlewares/validate.js` be reused unchanged as a
 * Fastify `preValidation` hook?
 *
 * Two things could break and would force a rewrite of 118 Joi schemas'
 * call sites:
 *
 *  1. Mutation. validate() writes back with `Object.assign(req.query, ...)`.
 *     If Fastify's `request.query` were a lazily-parsed getter, the write
 *     would be lost and coerced values / defaults would never reach the
 *     controller.
 *  2. Signature. The middleware is `(req, res, next)`. Fastify hooks are
 *     `(request, reply, done)` when callback-style, so the argument positions
 *     line up - but only if `done(err)` produces the same 400 body Express's
 *     `next(new ApiError(...))` did.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import Joi from 'joi';

const validate = require('../src/middlewares/validate');
const ApiError = require('../src/utils/ApiError');
const { errorConverter, errorHandler } = require('../src/middlewares/error');

const schema = {
  params: Joi.object({ id: Joi.string().required() }),
  query: Joi.object({
    page: Joi.number().integer().default(1),
    q: Joi.string().allow(''),
  }),
  body: Joi.object({
    name: Joi.string().required().min(2),
    tag: Joi.string().default('auto'),
  }),
};

const echo = (source) => ({
  params: { ...source.params },
  query: { ...source.query },
  body: source.body === undefined ? null : { ...source.body },
});

const { buildFastify } = await import('../src/fastify');

describe('Phase 2.5 spike - validate() as a Fastify preValidation hook', () => {
  let fastify;
  let expressApp;

  beforeAll(async () => {
    fastify = await buildFastify();
    fastify.post(
      '/__validate/:id',
      { preValidation: validate(schema) },
      async (request) => echo(request)
    );
    await fastify.ready();

    const express = (await import('express')).default;
    expressApp = express();
    expressApp.use(express.json({ limit: '5mb' }));
    expressApp.post('/__validate/:id', validate(schema), (req, res) => res.json(echo(req)));
    expressApp.use((err, req, res, _next) => {
      errorConverter(err, req, res, () => {});
      res.status(err.statusCode || 500).json({
        success: false,
        code: err.statusCode || 500,
        message: err.message,
        extra: err.extra,
      });
    });
  });

  afterAll(async () => {
    if (fastify) await fastify.close();
  });

  it('persists coerced types, defaults and injected keys back onto request.query', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/__validate/abc123?page=7',
      payload: { name: 'LocalWala' },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    // `page` arrives as the string '7' and must be written back as a number.
    expect(body.query.page).toBe(7);
    // `tag` is not in the request at all; Joi's default must be injected.
    expect(body.body).toEqual({ name: 'LocalWala', tag: 'auto' });
    expect(body.params).toEqual({ id: 'abc123' });
  });

  it('produces the same 400 body as Express for an invalid payload', async () => {
    const fastifyRes = await fastify.inject({
      method: 'POST',
      url: '/__validate/abc123',
      payload: { name: 'x' },
    });

    const expressRes = await request(expressApp)
      .post('/__validate/abc123')
      .send({ name: 'x' });

    const strip = ({ stack, ...rest }) => rest;
    expect(fastifyRes.statusCode).toBe(400);
    expect(expressRes.status).toBe(400);
    expect(strip(fastifyRes.json())).toEqual(strip(expressRes.body));
    expect(fastifyRes.json()).toMatchObject({ success: false, code: 400 });
    expect(fastifyRes.json().message).toMatch(/name/);
  });

  it('passes through untouched when the schema declares no keys', async () => {
    const noop = validate({});
    let called = false;
    noop({ query: { a: '1' } }, {}, (err) => {
      called = true;
      expect(err).toBeUndefined();
    });
    expect(called).toBe(true);
  });

  it('reports failure through done(err), not a thrown error', async () => {
    const failing = validate({ body: Joi.object({ must: Joi.required() }) });
    let captured;
    failing({ body: {} }, {}, (err) => {
      captured = err;
    });
    expect(captured).toBeInstanceOf(ApiError);
    expect(captured.statusCode).toBe(400);
  });
});
