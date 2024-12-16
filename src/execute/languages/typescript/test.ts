import { exec } from 'src/utils/exec';
import { CodeExecutionStrategy, FileWriterStrategy } from '../interfaces';
import { createFile } from 'src/utils/fs';
import { createExecutionResponse } from './testExecutionResult';

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
  async execute(codePath: string) {
    try {
      const jestResult = await exec(codePath, 'npx jest --json');
      const jestOutput = JSON.parse(jestResult);
      return createExecutionResponse(jestOutput);
    } catch (err) {
      return createExecutionResponse({
        testResults: [
          {
            message:
              err instanceof Error ? err.stack || err.message : String(err),
            assertionResults: [],
            startTime: 0,
            endTime: 0,
          },
        ],
        numRuntimeErrorTestSuites: 1,
      });
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
