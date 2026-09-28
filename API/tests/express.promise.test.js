/**
 * Phase 2.1 spike: is `catchAsync` still needed at all?
 *
 * The Fastify port wants `catchAsync = (fn) => fn` (identity), because
 * Fastify handles a returned rejected promise itself. Before touching all
 * 1,477 call sites we must know that Express 5 does the same - otherwise
 * turning catchAsync into identity would turn every handler rejection into an
 * unhandled promise rejection instead of a 500.
 */
import { describe, it, expect, vi } from 'vitest';
import express from 'express';
import request from 'supertest';

const boom = async () => {
  throw new Error('boom');
};

function buildApp(handler) {
  const app = express();
  app.get('/spike', handler);
  app.use((err, req, res, _next) => {
    res.status(500).json({ handled: true, message: err.message });
  });
  return app;
}

describe('Phase 2.1 spike - async handler rejections', () => {
  it('Express 5 forwards a rejected async handler to the error middleware', async () => {
    const res = await request(buildApp(boom)).get('/spike');
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ handled: true, message: 'boom' });
  });

  it('Express 5 forwards a rejected async (req, res) handler', async () => {
    const handler = async (req, res) => {
      res.status(200);
      throw new Error('after-response');
    };
    const res = await request(buildApp(handler)).get('/spike');
    // Either path is acceptable as long as it does not hang or crash.
    expect([200, 500]).toContain(res.status);
  });

  it('identity catchAsync keeps error handling working', async () => {
    const identityCatchAsync = (fn) => fn; // the proposed Fastify-friendly form
    const res = await request(buildApp(identityCatchAsync(boom))).get('/spike');
    expect(res.status).toBe(500);
    expect(res.body.handled).toBe(true);
  });

  it('no unhandled rejection escapes', async () => {
    const onUnhandled = vi.fn();
    process.once('unhandledRejection', onUnhandled);
    await request(buildApp(boom)).get('/spike');
    await new Promise((r) => setTimeout(r, 50));
    process.off('unhandledRejection', onUnhandled);
    expect(onUnhandled).not.toHaveBeenCalled();
  });
});
