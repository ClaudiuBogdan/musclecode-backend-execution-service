import { CodeExecutionStrategy, FileWriterStrategy } from '../interfaces';
import { createFile } from 'src/utils/fs';
import { exec } from 'src/utils/exec';
import { createExecutionResponse } from '../typescript/testExecutionResult';

const jestConfig = `module.exports = {
  testEnvironment: 'node',
  transform: {},
  testMatch: ['**/*.test.js', '**/*_test.js', '**/test_*.js'],
  verbose: true,
  moduleFileExtensions: ['js', 'json'],
  setupFilesAfterEnv: ['./jest.setup.js'],
  // TODO: add console output to response
  //reporters: ['default', 'jest-console-reporter']
};`;

const jestSetup = `
// Jest setup file
jest.setTimeout(10000); // 10 second timeout
// TODO: add a timeout. This one is not working

// Add any custom matchers or global setup here
expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () =>
          \`expected \${received} not to be within range \${floor} - \${ceiling}\`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          \`expected \${received} to be within range \${floor} - \${ceiling}\`,
        pass: false,
      };
    }
  },
});
`;

export class JavaScriptExecutor implements CodeExecutionStrategy {
  async execute(codePath: string) {
    try {
      // // First, install the jest-console-reporter
      // await exec(codePath, 'npm install --save-dev jest-console-reporter');

      // // Run tests with both JSON output and console reporter
      // const jestResult = await exec(codePath, 'jest --json --useStderr');
      // const jestOutput = JSON.parse(jestResult);

      // // Get the console output from stderr (where Jest writes it with --useStderr)
      // const consoleOutput = await exec(
      //   codePath,
      //   'jest --reporters=jest-console-reporter',
      // );

      const jestResult = await exec(codePath, 'jest --json --useStderr');
      const jestOutput = JSON.parse(jestResult);

      // Transform the Jest output to match the expected structure
      const transformedOutput = {
        testResults: jestOutput.testResults.map((result) => ({
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
        numFailedTestSuites: jestOutput.numFailedTestSuites,
        numFailedTests: jestOutput.numFailedTests,
        numPassedTestSuites: jestOutput.numPassedTestSuites,
        numPassedTests: jestOutput.numPassedTests,
        numPendingTestSuites: jestOutput.numPendingTestSuites,
        numPendingTests: jestOutput.numPendingTests,
        numRuntimeErrorTestSuites: jestOutput.numRuntimeErrorTestSuites,
        numTotalTestSuites: jestOutput.numTotalTestSuites,
        numTotalTests: jestOutput.numTotalTests,
        success: jestOutput.success,
        stdout: jestOutput.stdout || '',
        stderr: jestOutput.stderr || '',
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
  async write(filePath: string, code: string): Promise<void> {
    // Write the main code file
    await createFile(
      {
        id: 'main',
        filename: 'index.test',
        extension: 'js',
        content: code,
      },
      filePath,
    );

    // Write Jest config
    await createFile(
      {
        id: 'jest-config',
        filename: 'jest.config',
        extension: 'js',
        content: jestConfig,
      },
      filePath,
    );

    // Write Jest setup
    await createFile(
      {
        id: 'jest-setup',
        filename: 'jest.setup',
        extension: 'js',
        content: jestSetup,
      },
      filePath,
    );

    // Write package.json
    await createFile(
      {
        id: 'package',
        filename: 'package',
        extension: 'json',
        content: JSON.stringify(
          {
            name: 'code-execution',
            version: '1.0.0',
            private: true,
            scripts: {
              test: 'jest',
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
