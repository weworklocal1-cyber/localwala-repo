import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
    setupFiles: ['tests/setup.js'],
    // The app boots firebase + passport + mongoose models at import time,
    // so tests must not run in parallel against the same module graph.
    fileParallelism: false,
    pool: 'forks',
    testTimeout: 300000,
    hookTimeout: 120000,
    teardownTimeout: 30000,
  },
});
