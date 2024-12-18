import { CodeExecutionStrategy, FileWriterStrategy } from '../interfaces';
import { createFile } from 'src/utils/fs';
import { exec } from 'src/utils/exec';
import { createExecutionResponse } from '../typescript/testExecutionResult';
import { AlgorithmFile } from 'src/execute/interfaces';

const vitestConfig = `
const { defineConfig } = require('vitest/config');

module.exports = defineConfig({
  test: {
    environment: 'node',
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
    failFast: true,
    silent: false,
    reporters: ['json'],
  },
});
`;

export class JavaScriptExecutor implements CodeExecutionStrategy {
  async execute(codePath: string) {
    try {
      // Install Vitest using cache
      await exec(codePath, 'npm install --save-dev vitest');
      const vitestResult = await exec(
        codePath,
        'npx vitest run --reporter json',
      );
      const vitestOutput = JSON.parse(vitestResult);

      // Transform the Jest output to match the expected structure
      const transformedOutput = {
        testResults: vitestOutput.testResults.map((result) => ({
          assertionResults: result.assertionResults,
          startTime: result.startTime,
          endTime: result.endTime,
          message: result.message,
          status: result.status,
          name: result.name,
          console: result.console || [], // Include console output from test results
        })),
        numFailedTestSuites: vitestOutput.numFailedTestSuites,
        numFailedTests: vitestOutput.numFailedTests,
        numPassedTestSuites: vitestOutput.numPassedTestSuites,
        numPassedTests: vitestOutput.numPassedTests,
        numPendingTestSuites: vitestOutput.numPendingTestSuites,
        numPendingTests: vitestOutput.numPendingTests,
        numRuntimeErrorTestSuites: vitestOutput.numRuntimeErrorTestSuites,
        numTotalTestSuites: vitestOutput.numTotalTestSuites,
        numTotalTests: vitestOutput.numTotalTests,
        success: vitestOutput.success,
        stdout: vitestOutput.stdout || '',
        stderr:
          vitestOutput.stderr || vitestOutput.testResults[0]?.message || '', // Include test result message in stderr
        // Aggregate all console output from test results
        consoleOutput: vitestOutput.testResults
          .flatMap((result) => result.console || [])
          .map((entry) => ({
            type: entry.type,
            message: entry.message,
            origin: entry.origin,
          })),
      };

      return createExecutionResponse(transformedOutput);
    } catch (err) {
      return createExecutionResponse({
        testResults: [
          {
            message:
              err instanceof Error ? err.stack || err.message : String(err),
            assertionResults: [],
            startTime: 0,
            endTime: 0,
            status: 'failed',
            name: 'Runtime Error',
          },
        ],
        numFailedTestSuites: 1,
        numFailedTests: 0,
        numPassedTestSuites: 0,
        numPassedTests: 0,
        numTotalTestSuites: 1,
        numTotalTests: 0,
        numRuntimeErrorTestSuites: 1,
        success: false,
        stdout: '',
        stderr: err instanceof Error ? err.stack || err.message : String(err),
      });
    }
  }
}

export class JavaScriptFileWriter implements FileWriterStrategy {
  async write(filePath: string, files: AlgorithmFile[]): Promise<void> {
    // Write user files
    for (const file of files) {
      await createFile(file, filePath);
    }

    // Write Vitest config
    await createFile(
      {
        id: 'vitest-setup',
        name: 'vitest.config',
        extension: 'js',
        content: vitestConfig,
      },
      filePath,
    );

    // Write package.json
    await createFile(
      {
        id: 'package',
        name: 'package',
        extension: 'json',
        content: JSON.stringify(
          {
            name: 'code-execution',
            version: '1.0.0',
            private: true,
            scripts: {
              test: 'vitest',
            },
          },
          null,
          2,
        ),
      },
      filePath,
    );
  }
}
