/**
 * Global test setup (runs before every test file).
 *
 * Vitest sets NODE_ENV=test itself.
 */
import mongoose from 'mongoose';
import { createRequire } from 'node:module';

const require_ = createRequire(import.meta.url);

// ---------------------------------------------------------------------------
// 1. Fail fast instead of buffering.
//
// Without a DB connection every query would buffer for the default 10s before
// failing, which would make the HTTP smoke suite take hours instead of
// seconds. Disabling buffering keeps it offline, deterministic and quick.
// ---------------------------------------------------------------------------
mongoose.set('bufferCommands', false);

// ---------------------------------------------------------------------------
// 2. Neutralise the boot-time cron side effect.
//
// src/app.js calls CronJobScheduler.startCronJob() at require time, which
// immediately issues deleteMany()/save() against MongoDB. Without a connection
// that becomes an unhandled rejection and fails the run.
//
// vi.mock() cannot be used here: vitest only intercepts ESM imports, and this
// codebase is CommonJS (require() goes straight to Node's module cache).
// Patching the cached export instead intercepts app.js successfully.
// ---------------------------------------------------------------------------
const cronScheduler = require_('../src/services/cron.job.scheduler.service');

cronScheduler.startCronJobScheduler.startCronJob = async function startCronJobStub() {
  return undefined;
};
