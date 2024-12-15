import { exec } from 'src/utils/exec';
import { CodeExecutionStrategy, FileWriterStrategy } from '../interfaces';
import { createFile } from 'src/utils/fs';
import { CodeExecutionResponse, TestItem } from 'src/execute/interfaces';

const jestConfig = `module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts', '**/*_test.ts', '**/test_*.ts'],
  verbose: true,
  moduleFileExtensions: ['ts', 'js', 'json'],
  setupFilesAfterEnv: ['./jest.setup.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
};`;

const jestSetup = `
// Jest setup file
jest.setTimeout(10000); // 10 second timeout

// Add any custom matchers or global setup here
expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
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

const tsConfig = `{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "rootDir": ".",
    "types": ["jest", "node"]
  },
  "include": ["./**/*.ts"],
  "exclude": ["node_modules"]
}`;

export class TypeScriptExecutor implements CodeExecutionStrategy {
  async execute(codePath: string): Promise<CodeExecutionResponse> {
    try {
      const jestResult = await exec(codePath, 'npx jest --json');
      const jestOutput = JSON.parse(jestResult);

      if (!jestOutput.testResults || jestOutput.testResults.length === 0) {
        return {
          type: 'execution error',
          stdout: '',
          stderr: 'No test results found or compilation failed.',
          exitCode: 1,
          wallTime: 0,
          timedOut: false,
          message: 'No test results found or compilation failed.',
          token: '',
          result: {
            serverError: true,
            completed: false,
            output: [],
            successMode: 'assertions',
            passed: 0,
            failed: 1,
            errors: 1,
            error: 'No test results found or compilation failed.',
            assertions: {
              passed: 0,
              failed: 1,
              hidden: { passed: 0, failed: 0 },
            },
            specs: { passed: 0, failed: 1, hidden: { passed: 0, failed: 0 } },
            unweighted: { passed: 0, failed: 1 },
            weighted: { passed: 0, failed: 1 },
            timedOut: false,
            wallTime: 0,
            testTime: 0,
            tags: null,
          },
        };
      }

      const testResults = jestOutput.testResults[0];
      const passed = testResults.assertionResults.filter(
        (t) => t.status === 'passed',
      ).length;
      const failed = testResults.assertionResults.filter(
        (t) => t.status === 'failed',
      ).length;
      const errors = 0; // No pending or todo tests in the output

      const testItems: TestItem[] = testResults.assertionResults.map(
        (test) => ({
          t: test.status === 'passed' ? 'passed' : 'failed',
          v: test.title,
          p: test.status === 'passed',
          items: test.ancestorTitles.map((title) => ({
            t: 'describe',
            v: title,
            p: true,
          })),
        }),
      );

      return {
        type: failed === 0 ? 'execution success' : 'execution error',
        stdout: jestOutput.stdout || '',
        stderr: jestOutput.stderr || '',
        exitCode: failed === 0 ? 0 : 1,
        wallTime: testResults.endTime - testResults.startTime,
        timedOut: false,
        message: failed === 0 ? 'All tests passed' : 'Some tests failed',
        token: '',
        result: {
          serverError: false,
          completed: true,
          output: testItems,
          successMode: 'assertions',
          passed,
          failed,
          errors,
          error: null,
          assertions: {
            passed,
            failed,
            hidden: { passed: 0, failed: 0 },
          },
          specs: {
            passed,
            failed,
            hidden: { passed: 0, failed: 0 },
          },
          unweighted: {
            passed,
            failed,
          },
          weighted: {
            passed,
            failed,
          },
          timedOut: false,
          wallTime: testResults.endTime - testResults.startTime,
          testTime: testResults.assertionResults[0]?.duration || 0,
          tags: null,
        },
      };
    } catch (err) {
      console.error('Error executing jest:', err);
      return {
        type: 'execution error',
        stdout: '',
        stderr: err instanceof Error ? err.stack || err.message : String(err),
        exitCode: 1,
        wallTime: 0,
        timedOut: false,
        message: err instanceof Error ? err.message : String(err),
        token: '',
        result: {
          serverError: true,
          completed: false,
          output: [],
          successMode: 'assertions',
          passed: 0,
          failed: 1,
          errors: 1,
          error: err instanceof Error ? err.message : String(err),
          assertions: {
            passed: 0,
            failed: 1,
            hidden: { passed: 0, failed: 0 },
          },
          specs: { passed: 0, failed: 1, hidden: { passed: 0, failed: 0 } },
          unweighted: { passed: 0, failed: 1 },
          weighted: { passed: 0, failed: 1 },
          timedOut: false,
          wallTime: 0,
          testTime: 0,
          tags: null,
        },
      };
    }
  }
}

export class TypeScriptFileWriter implements FileWriterStrategy {
  async write(filePath: string, code: string): Promise<void> {
    // Write the main code file
    await createFile(
      {
        id: 'main',
        filename: 'index.test',
        extension: 'ts',
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
        extension: 'ts',
        content: jestSetup,
      },
      filePath,
    );

    // Write tsconfig.json
    await createFile(
      {
        id: 'tsconfig',
        filename: 'tsconfig',
        extension: 'json',
        content: tsConfig,
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
              build: 'tsc',
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
