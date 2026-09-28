/**
 * Signs access tokens exactly the way src/services/token.service.js does,
 * so passport-jwt accepts them without needing a Token collection row
 * (the auth middleware only verifies the signature + payload.type and then
 * loads the user by `sub`).
 */
import jwt from 'jsonwebtoken';
import { createRequire } from 'node:module';

const require_ = createRequire(import.meta.url);
const config = require_('../../src/config/config');
const { roleRights } = require_('../../src/config/roles');

export function signAccessToken(userId, expiresInSeconds = 3600) {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: String(userId),
    iat: now,
    exp: now + expiresInSeconds,
    type: 'access',
  };
  return jwt.sign(payload, config.jwt.secret);
}

/**
 * Pick the seeded role that satisfies a route's required rights.
 * Falls back to `fallback` when the route has no rights or none match.
 */
export function pickRoleForRights(rights, fallback = 'admin') {
  if (!rights || !rights.length) return fallback;

  for (const [role, granted] of roleRights) {
    if (rights.every((r) => granted.includes(r))) return role;
  }
  return fallback;
}
