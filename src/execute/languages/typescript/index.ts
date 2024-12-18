import { CodeExecutionStrategy, FileWriterStrategy } from '../interfaces';
import { createFile } from 'src/utils/fs';
import { exec } from 'src/utils/exec';
import { createExecutionResponse } from './testExecutionResult';
import { AlgorithmFile } from 'src/execute/interfaces';

const vitestConfig = `
const { defineConfig } = require('vitest/config');

module.exports = defineConfig({
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
`;

export class TypeScriptExecutor implements CodeExecutionStrategy {
  async execute(codePath: string) {
    try {
      // TODO: Remove this when we have a way to install dependencies
      await exec(codePath, 'npm install --save-dev vitest');
      const vitestResult = await exec(
        codePath,
        'npx vitest run --reporter json',
      );
      console.log(vitestResult);
      const vitestOutput = JSON.parse(vitestResult);

      // Transform the Jest output to match the expected structure
      const transformedOutput = {
        testResults: vitestOutput.testResults.map((result) => ({
          assertionResults: result.assertionResults.map((test) => ({
            ancestorTitles: test.ancestorTitles,
            title: test.title,
            status: test.status,
            duration: test.duration,
            failureMessages: test.failureMessages || [],
          })),
          startTime: result.startTime,
          endTime: result.endTime,
          message: result.message,
          status: result.status,
          name: result.name,
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
        stderr: vitestOutput.stderr || '',
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

export class TypeScriptFileWriter implements FileWriterStrategy {
  async write(filePath: string, files: AlgorithmFile[]): Promise<void> {
    // Write user files
    for (const file of files) {
      await createFile(file, filePath);
    }

    // Write Jest config
    await createFile(
      {
        id: 'vitest-config',
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

    // Write tsconfig.json
    await createFile(
      {
        id: 'tsconfig',
        name: 'tsconfig',
        extension: 'json',
        content: JSON.stringify(
          {
            compilerOptions: {
              target: 'es2020',
              module: 'commonjs',
              strict: true,
              esModuleInterop: true,
              skipLibCheck: true,
              forceConsistentCasingInFileNames: true,
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
