const { defineConfig } = require('vitest/config');

module.exports = defineConfig({
  test: {
    environment: 'node',
    timeout: 5000,
    include: ['**/test.js'],
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
    outputFile: './test-output.json',
  },
});
