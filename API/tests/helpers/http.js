/**
 * Shared request helper for the DB-backed suites: substitutes concrete path
 * params, picks a seeded role that satisfies the route's required rights and
 * signs a token in the channel (cookie vs Bearer) the route expects.
 */
import request from 'supertest';
import { createRequire } from 'node:module';

import { signAccessToken } from './token.js';
import { usersByRole } from './seed.js';

const require_ = createRequire(import.meta.url);
const config = require_('../../src/config/config');
const { roleRights } = require_('../../src/config/roles');

// jwt-app routes are called by the Flutter apps; jwt-web routes by the
// Angular admin and the vendor_web console.
export const APP_ROLES = ['user', 'driver', 'vendor', 'kitchen', 'waiter'];
export const WEB_ROLES = ['admin', 'cityMaster', 'supportTeam', 'accountant', 'vendor', 'waiter', 'kitchen'];
const ALL_ROLES = [...new Set([...WEB_ROLES, ...APP_ROLES])];

// Params that name a Mongo document must be a valid ObjectId, otherwise the
// Joi schema rejects them and we only measure param validation, not the route.
const OBJECT_ID_PARAM = /id|user|vendor|restaurant|deliveryman|order|payment|city|cuisine|category|food|coupon|wallet|transaction|disbursement|subscription|address|cart|review|campaign|banner|notification|role/i;
export const VALID_OBJECT_ID = '000000000000000000000001';

export function concretePath(p) {
  return p.replace(/:([^/]+)/g, (whole, name) =>
    OBJECT_ID_PARAM.test(name) ? VALID_OBJECT_ID : 'probe-value'
  );
}

/** Choose a seeded role that satisfies every right the route requires. */
export function roleFor(route) {
  const preferred = route.auth === 'jwt-app' ? APP_ROLES : WEB_ROLES;
  const rights = route.rights || [];
  if (!rights.length) return preferred[0];

  const holds = (role) => {
    const granted = roleRights.get(role) || [];
    return rights.every((right) => granted.includes(right));
  };

  return preferred.find(holds) || ALL_ROLES.find(holds) || preferred[0];
}

export function authFor(route) {
  if (!route.auth) return { token: null, strategy: null, role: null };

  const role = roleFor(route);
  return { token: signAccessToken(usersByRole[role]._id), strategy: route.auth, role };
}

/**
 * Fire the route. Always resolves - transport failures surface as
 * `{ status: 'ERROR:...' }` so a suite can assert on them without throwing.
 */
export async function hitRoute(app, route, { timeoutMs = 8000 } = {}) {
  const { token, strategy } = authFor(route);
  let req = request(app).get(concretePath(route.path));

  if (token && strategy === 'jwt-app') req = req.set('Authorization', `Bearer ${token}`);
  if (token && strategy === 'jwt-web') req = req.set('Cookie', `${config.jwt.cookieName}=${token}`);

  try {
    const res = await req.timeout({ response: timeoutMs });
    return {
      status: res.status,
      contentType: res.headers['content-type'] || '',
      body: res.body,
      text: res.text,
    };
  } catch (err) {
    if (err?.response) {
      return {
        status: err.response.status,
        contentType: err.response.headers?.['content-type'] || '',
        body: err.response.body,
        text: err.response.text,
      };
    }
    return { status: `ERROR:${err?.code || err?.message}`, contentType: '', body: undefined, text: '' };
  }
}
