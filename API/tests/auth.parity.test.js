/**
 * Phase 2.6 parity gate: Express/Passport vs Fastify/@fastify/jwt.
 *
 * Two independent auth implementations are live for the duration of Phases
 * 2.6-2.8 (see the header comment in src/auth/fastifyAuth.ts for why). This
 * file is what keeps them honest: every request is fired at BOTH servers and
 * the status + body must match exactly.
 *
 * The matrix covers everything `auth.factory.js` and `config/passport.js`
 * actually branch on:
 *   - token presence, shape, signature, expiry, algorithm
 *   - `payload.type` (refresh tokens must not authenticate)
 *   - the user row existing (deleted account)
 *   - strategy mismatch (Bearer on jwt-web, cookie on jwt-app, Basic scheme)
 *   - header parsing edge cases passport-jwt's bundled auth_header regex has
 *   - role rights, the Forbidden body, and the self-escape `:userId` rule
 *   - the double-execution guard: `auth.factory`'s middleware is
 *     `async (req,res,next)` and Fastify both invokes `done` and consumes the
 *     returned promise, so a naive port could run the handler twice
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import express from 'express';
import mongoose from 'mongoose';
import { createRequire } from 'node:module';

const require_ = createRequire(import.meta.url);
const config = require_('../src/config/config');
const passport = require_('passport');
const { jwtWebStrategy, jwtAppStrategy } = require_('../src/config/passport');
const { roleRights } = require_('../src/config/roles');
const expressAppAuth = require_('../src/middlewares/appAuth');
const expressWebAuth = require_('../src/middlewares/webAuth');
const { errorConverter, errorHandler } = require_('../src/middlewares/error');

const { connectTestDb, disconnectTestDb } = await import('./helpers/db.js');
const { seedUsers, clearUsers, usersByRole, SEEDED_ROLES } = await import('./helpers/seed.js');
const { signAccessToken } = await import('./helpers/token.js');
const { buildFastify } = await import('../src/fastify');
const { appAuth: fastifyAppAuth, webAuth: fastifyWebAuth } = await import(
  '../src/auth/fastifyAuth'
);

/** A right that admin holds and at least one seeded role does not. */
function pickContestedRight() {
  const adminRights = roleRights.get('admin') || [];
  for (const right of adminRights) {
    const lacking = SEEDED_ROLES.find((role) => !(roleRights.get(role) || []).includes(right));
    if (lacking) return { right, lacking };
  }
  throw new Error('no contested right found');
}

const { right, lacking } = pickContestedRight();

const userBody = (user, userId) => ({
  user: String(user._id),
  role: user.role,
  userId,
});

describe('Phase 2.6 - Express/Passport vs Fastify/@fastify/jwt', () => {
  let fastify;
  let expressApp;
  let lackingToken;
  let adminToken;
  let doubleHits = 0;

  beforeAll(async () => {
    await connectTestDb();
    await seedUsers();

    // src/app.js registers these at require time; replicate for the test.
    passport.use('jwt-web', jwtWebStrategy);
    passport.use('jwt-app', jwtAppStrategy);

    adminToken = signAccessToken(usersByRole.admin._id);
    lackingToken = signAccessToken(usersByRole[lacking]._id);

    // ---- Fastify: @fastify/jwt implementation -----------------------------
    fastify = await buildFastify();
    fastify.get('/__auth/:userId', { preHandler: fastifyAppAuth(right) }, async (request) =>
      userBody(request.user, request.params.userId)
    );
    fastify.get('/__authweb', { preHandler: fastifyWebAuth() }, async (request) =>
      userBody(request.user, '-')
    );
    fastify.get(
      '/__double/:userId',
      { preHandler: fastifyAppAuth(right) },
      async (request) => {
        doubleHits += 1;
        return { hits: doubleHits, userId: request.params.userId };
      }
    );
    await fastify.ready();

    // ---- Express: passport implementation ---------------------------------
    expressApp = express();
    expressApp.use(express.json());
    expressApp.use(cookieParser());
    expressApp.get(
      '/__auth/:userId',
      expressAppAuth(right),
      (req, res) => res.json(userBody(req.user, req.params.userId))
    );
    expressApp.get('/__authweb', expressWebAuth(), (req, res) =>
      res.json(userBody(req.user, '-'))
    );
    expressApp.use((err, req, res, _next) => {
      errorConverter(err, req, res, (converted) =>
        errorHandler(converted, req, res, () => {})
      );
    });
  }, 60000);

  afterAll(async () => {
    if (fastify) await fastify.close();
    await clearUsers();
    await disconnectTestDb();
  });

  /** Fire the same request at both servers and assert identical answers. */
  async function compare(path, apply) {
    const fastifyRequest = { method: 'GET', url: path };
    const expressRequest = { method: 'GET', url: path };
    apply(fastifyRequest);
    apply(expressRequest);

    const fRes = await fastify.inject(fastifyRequest);
    const eRes = await request(expressApp)
      .get(expressRequest.url)
      .set(expressRequest.headers || {});
    const eBody =
      typeof eRes.text === 'string' && eRes.text.length ? JSON.parse(eRes.text) : eRes.body;

    expect(
      { status: fRes.statusCode, body: fRes.json() },
      `express: ${eRes.status} ${JSON.stringify(eBody)}\nfastify: ${fRes.statusCode} ${JSON.stringify(
        fRes.json()
      )}`
    ).toEqual({ status: eRes.status, body: eBody });
    return fRes;
  }

  const withBearer = (token) => (r) => {
    r.headers = { ...(r.headers || {}), authorization: `Bearer ${token}` };
  };
  const withCookie = (token) => (r) => {
    r.headers = { ...(r.headers || {}), cookie: `${config.jwt.cookieName}=${token}` };
  };
  const withRawHeader = (value) => (r) => {
    r.headers = { ...(r.headers || {}), authorization: value };
  };

  it('rejects a missing token identically', async () => {
    const res = await compare('/__auth/000000000000000000000001', () => {});
    expect(res.statusCode).toBe(401);
    expect(res.json()).toMatchObject({ success: false, code: 401, message: 'Please authenticate' });
  });

  it('rejects a malformed token identically', async () => {
    const res = await compare('/__auth/000000000000000000000001', withBearer('not-a-jwt'));
    expect(res.statusCode).toBe(401);
  });

  it('rejects a non-access token identically (refresh tokens must not work)', async () => {
    const refresh = jwt.sign(
      { sub: String(usersByRole.admin._id), type: 'refresh' },
      config.jwt.secret
    );
    const res = await compare('/__auth/000000000000000000000001', withBearer(refresh));
    expect(res.statusCode).toBe(401);
  });

  it('rejects a wrong signature identically', async () => {
    const forged = jwt.sign({ sub: String(usersByRole.admin._id), type: 'access' }, 'wrong-secret');
    const res = await compare('/__auth/000000000000000000000001', withBearer(forged));
    expect(res.statusCode).toBe(401);
  });

  it('rejects an expired token identically', async () => {
    const expired = signAccessToken(usersByRole.admin._id, -60);
    const res = await compare('/__auth/000000000000000000000001', withBearer(expired));
    expect(res.statusCode).toBe(401);
  });

  it('rejects a token for a user that no longer exists', async () => {
    const orphan = signAccessToken(new mongoose.Types.ObjectId());
    const res = await compare('/__auth/000000000000000000000001', withBearer(orphan));
    expect(res.statusCode).toBe(401);
  });

  it('rejects a token signed with an unexpected algorithm identically', async () => {
    const hs512 = jwt.sign(
      { sub: String(usersByRole.admin._id), type: 'access' },
      Buffer.from('x'.repeat(64)),
      { algorithm: 'HS512' }
    );
    const res = await compare('/__auth/000000000000000000000001', withBearer(hs512));
    expect(res.statusCode).toBe(401);
  });

  it('rejects a Bearer token on the cookie-only (jwt-web) strategy', async () => {
    const res = await compare('/__authweb', withBearer(adminToken));
    expect(res.statusCode).toBe(401);
  });

  it('rejects a cookie token on the Bearer-only (jwt-app) strategy', async () => {
    const res = await compare('/__auth/000000000000000000000001', withCookie(adminToken));
    expect(res.statusCode).toBe(401);
  });

  it('accepts a lowercase `bearer` scheme (passport-jwt matches case-insensitively)', async () => {
    const res = await compare('/__auth/000000000000000000000001', withRawHeader(
      `bearer ${adminToken}`
    ));
    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ role: 'admin' });
  });

  it('rejects a non-Bearer scheme identically', async () => {
    const res = await compare('/__auth/000000000000000000000001', withRawHeader(
      `Basic ${adminToken}`
    ));
    expect(res.statusCode).toBe(401);
  });

  it('extracts only the credential when the header carries trailing junk', async () => {
    const res = await compare('/__auth/000000000000000000000001', withRawHeader(
      `Bearer ${adminToken} extra-fragment`
    ));
    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ role: 'admin' });
  });

  it('accepts a cookie on the web strategy and exposes the user', async () => {
    const res = await compare('/__authweb', withCookie(adminToken));
    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ role: 'admin' });
  });

  it('forbids a role that lacks the required right', async () => {
    const res = await compare('/__auth/000000000000000000000001', withBearer(lackingToken));
    expect(res.statusCode).toBe(403);
    expect(res.json()).toMatchObject({ code: 403, message: 'Forbidden' });
  });

  it('allows the same under-privileged user to reach its own :userId (self-escape)', async () => {
    const ownId = String(usersByRole[lacking]._id);
    const res = await compare(`/__auth/${ownId}`, withBearer(lackingToken));
    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ role: lacking, userId: ownId });
  });

  it('allows a privileged user through', async () => {
    const res = await compare('/__auth/000000000000000000000001', withBearer(adminToken));
    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ role: 'admin' });
  });

  it('never runs the handler twice (double-callback guard)', async () => {
    doubleHits = 0;
    const res = await fastify.inject({
      method: 'GET',
      url: '/__double/000000000000000000000001',
      headers: { authorization: `Bearer ${adminToken}` },
    });
    expect(res.statusCode).toBe(200);
    // Wait for the hook runner's promise path: a second execution would happen
    // on a microtask after `next()` already returned, so the response body
    // alone would look fine either way. The counter is the real assertion.
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(doubleHits).toBe(1);
    expect(res.json()).toEqual({ hits: 1, userId: '000000000000000000000001' });
  });

  it('exposes appAuth/webAuth as Fastify decorators with matching metadata', async () => {
    expect(typeof fastify.appAuth).toBe('function');
    expect(typeof fastify.webAuth).toBe('function');

    const fastifyHandler = fastify.appAuth('someRight', 'anotherRight');
    expect(fastifyHandler.isAuth).toBe(true);
    expect(fastifyHandler.authStrategy).toBe('jwt-app');
    expect(fastifyHandler.requiredRights).toEqual(['someRight', 'anotherRight']);

    const expressHandler = expressAppAuth('someRight', 'anotherRight');
    expect(expressHandler.isAuth).toBe(true);
    expect(expressHandler.authStrategy).toBe('jwt-app');
    expect(expressHandler.requiredRights).toEqual(['someRight', 'anotherRight']);

    const expressWebHandler = expressWebAuth();
    const fastifyWebHandler = fastify.webAuth();
    expect(fastifyWebHandler.authStrategy).toBe('jwt-web');
    expect(expressWebHandler.authStrategy).toBe('jwt-web');
    expect(fastifyWebHandler.requiredRights).toEqual([]);
    expect(expressWebHandler.requiredRights).toEqual([]);
  });
});
