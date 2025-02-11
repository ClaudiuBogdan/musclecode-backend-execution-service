import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    timeout: 5000,
    include: ['**/test.ts'],
    globals: true,
    setupFiles: [],
    maxThreads: 1,
    minThreads: 1,
    maxConcurrency: 1,
    fileParallelism: false,
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
    coverage: {
      enabled: false,
    },
    cache: false,
    failFast: false,
    silent: false,
    reporters: ['json'],
  },
});
