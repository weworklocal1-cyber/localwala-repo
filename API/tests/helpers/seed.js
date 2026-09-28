/**
 * Minimal fixtures for contract tests.
 *
 * One user per role is enough to satisfy auth.factory's roleRights check:
 * a route is reachable as long as *some* seeded role holds every required
 * right.
 */
import { createRequire } from 'node:module';

const require_ = createRequire(import.meta.url);
const User = require_('../../src/models/user.model');

export const SEEDED_ROLES = [
  'admin',
  'user',
  'driver',
  'vendor',
  'cityMaster',
  'supportTeam',
  'accountant',
  'kitchen',
  'waiter',
];

/** role -> user document (populated by seedUsers) */
export const usersByRole = {};

export async function seedUsers() {
  await User.deleteMany({});

  for (const role of SEEDED_ROLES) {
    const doc = await User.create({
      firstName: 'Contract',
      lastName: role.charAt(0).toUpperCase() + role.slice(1),
      email: `contract.${role}@localwala.test`,
      // Must contain a letter and a digit, minimum 8 chars.
      password: 'Contract123',
      role,
      countryCode: 91,
      mobile: `9000000${String(SEEDED_ROLES.indexOf(role)).padStart(3, '0')}`,
      isEmailVerified: true,
      isMobileVerified: true,
      status: true,
      locale: 'en',
    });
    usersByRole[role] = doc;
  }

  return usersByRole;
}

export async function clearUsers() {
  await User.deleteMany({});
}
