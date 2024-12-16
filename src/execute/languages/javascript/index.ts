import { CodeExecutionStrategy, FileWriterStrategy } from '../interfaces';
import { createFile } from 'src/utils/fs';
import { exec } from 'src/utils/exec';
import { CodeExecutionResponse, TestItem } from 'src/execute/interfaces';

const jestConfig = `module.exports = {
  testEnvironment: 'node',
  transform: {},
  testMatch: ['**/*.test.js', '**/*_test.js', '**/test_*.js'],
  verbose: true,
  moduleFileExtensions: ['js', 'json'],
  setupFilesAfterEnv: ['./jest.setup.js'],
};`;

const jestSetup = `
// Jest setup file
jest.setTimeout(10000); // 10 second timeout

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

function createTestHierarchy(testResults: any[]): TestItem[] {
  const hierarchy: { [key: string]: TestItem } = {};
  const topLevelTests: TestItem[] = [];

  testResults.forEach((test) => {
    const ancestorTitles = test.ancestorTitles;
    const testTitle = test.title;
    const isPassed = test.status === 'passed';

    // Handle top-level tests (no describe blocks)
    if (ancestorTitles.length === 0) {
      topLevelTests.push({
        t: isPassed ? 'passed' : 'failed',
        v: testTitle,
        p: isPassed,
      });
      return;
    }

    // Handle tests within describe blocks
    const rootDescribe = ancestorTitles[0];
    if (!hierarchy[rootDescribe]) {
      hierarchy[rootDescribe] = {
        t: 'describe',
        v: rootDescribe,
        p: true,
        items: [],
      };
    }

    let currentLevel = hierarchy[rootDescribe];

    // Handle nested describes (if any)
    for (let i = 1; i < ancestorTitles.length; i++) {
      const describeTitle = ancestorTitles[i];
      let nextLevel = currentLevel.items?.find(
        (item) => item.t === 'describe' && item.v === describeTitle,
      );

      if (!nextLevel) {
        nextLevel = {
          t: 'describe',
          v: describeTitle,
          p: true,
          items: [],
        };
        currentLevel.items = currentLevel.items || [];
        currentLevel.items.push(nextLevel);
      }
      currentLevel = nextLevel;
    }

    // Add the test to the deepest level
    currentLevel.items = currentLevel.items || [];
    currentLevel.items.push({
      t: isPassed ? 'passed' : 'failed',
      v: testTitle,
      p: isPassed,
    });

    // Update parent describe block's pass status
    if (!isPassed) {
      let current = hierarchy[rootDescribe];
      for (const title of ancestorTitles.slice(1)) {
        current.p = false;
        const nextLevel = current.items?.find(
          (item) => item.t === 'describe' && item.v === title,
        );
        if (!nextLevel) break;
        current = nextLevel;
      }
      current.p = false;
    }
  });

  // If we have top-level tests, create a default describe block for them
  if (topLevelTests.length > 0) {
    const allTopLevelTestsPassed = topLevelTests.every((test) => test.p);
    hierarchy['Tests'] = {
      t: 'describe',
      v: 'Tests',
      p: allTopLevelTestsPassed,
      items: topLevelTests,
    };
  }

  return Object.values(hierarchy);
}

export class JavaScriptExecutor implements CodeExecutionStrategy {
  async execute(codePath: string): Promise<CodeExecutionResponse> {
    try {
      // First, check for syntax errors using Node.js
      try {
        await exec(codePath, 'node --check index.test.js');
      } catch (syntaxError) {
        return {
          type: 'execution error',
          stdout: '',
          stderr:
            syntaxError instanceof Error
              ? syntaxError.message
              : String(syntaxError),
          exitCode: 1,
          wallTime: 0,
          timedOut: false,
          message: 'Syntax error',
          token: '',
          result: {
            serverError: false,
            completed: false,
            output: [],
            successMode: 'assertions',
            passed: 0,
            failed: 0,
            errors: 1,
            error:
              syntaxError instanceof Error
                ? syntaxError.message
                : String(syntaxError),
            assertions: {
              passed: 0,
              failed: 0,
              hidden: { passed: 0, failed: 0 },
            },
            specs: { passed: 0, failed: 0, hidden: { passed: 0, failed: 0 } },
            unweighted: { passed: 0, failed: 0 },
            weighted: { passed: 0, failed: 0 },
            timedOut: false,
            wallTime: 0,
            testTime: 0,
            tags: null,
          },
        };
      }

      // If syntax check passes, run tests
      const jestResult = await exec(codePath, 'npx jest --json');
      const jestOutput = JSON.parse(jestResult);

      if (!jestOutput.testResults || jestOutput.testResults.length === 0) {
        return {
          type: 'execution error',
          stdout: '',
          stderr: 'No test results found.',
          exitCode: 1,
          wallTime: 0,
          timedOut: false,
          message: 'No test results found.',
          token: '',
          result: {
            serverError: false,
            completed: false,
            output: [],
            successMode: 'assertions',
            passed: 0,
            failed: 1,
            errors: 1,
            error: 'No test results found.',
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
      const passed = testResults.numPassingTests;
      const failed = testResults.numFailingTests;
      const errors = testResults.numPendingTests + testResults.numTodoTests;
      const totalTests = passed + failed + errors;
      const allTestsPassed = passed > 0 && failed === 0 && errors === 0;

      const testItems = createTestHierarchy(testResults.testResults);

      return {
        type: allTestsPassed ? 'execution success' : 'execution error',
        stdout: jestOutput.stdout || '',
        stderr: jestOutput.stderr || '',
        exitCode: allTestsPassed ? 0 : 1,
        wallTime: testResults.endTime - testResults.startTime,
        timedOut: false,
        message: allTestsPassed ? 'All tests passed' : 'Some tests failed',
        token: '',
        result: {
          serverError: false,
          completed: allTestsPassed && totalTests > 0,
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
      console.error('Error executing tests:', err);
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
