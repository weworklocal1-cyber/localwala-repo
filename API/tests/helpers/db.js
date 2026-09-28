/**
 * Test database helpers.
 *
 * Uses a dedicated database (`foodbite_test`) derived from MONGODB_URL so the
 * suite can never touch real data, and wipes it before/after every run so
 * results are reproducible.
 */
import mongoose from 'mongoose';

function testUrl() {
  if (process.env.TEST_MONGODB_URL) return process.env.TEST_MONGODB_URL;

  const base =
    process.env.MONGODB_URL ||
    'mongodb://localhost:27017/foodbite';

  // Swap only the database name, keep credentials + query string intact.
  const match = base.match(/^(.*\/)([^/?]+)(\?.*)?$/);
  if (!match) return base;
  return `${match[1]}foodbite_test${match[3] || ''}`;
}

export const TEST_DB_URL = testUrl();

export async function connectTestDb() {
  await mongoose.connect(TEST_DB_URL, { serverSelectionTimeoutMS: 10000 });
  await mongoose.connection.dropDatabase();
}

export async function resetTestDb() {
  await mongoose.connection.dropDatabase();
}

export async function disconnectTestDb() {
  try {
    await mongoose.connection.dropDatabase();
  } catch (_) {
    /* ignore */
  }
  await mongoose.disconnect();
}
