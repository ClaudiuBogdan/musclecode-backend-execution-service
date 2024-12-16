import { TestItem, CodeExecutionResponse } from 'src/execute/interfaces';

interface JestAssertionResult {
  ancestorTitles: string[];
  title: string;
  status: 'passed' | 'failed' | 'pending' | 'todo' | 'disabled';
  duration?: number;
}

interface JestTestResult {
  assertionResults: JestAssertionResult[];
  startTime: number;
  endTime: number;
  message?: string;
}

interface JestOutput {
  testResults: JestTestResult[];
  numRuntimeErrorTestSuites?: number;
  stdout?: string;
  stderr?: string;
}

export const createTestHierarchy = (
  testResults: JestAssertionResult[],
): TestItem[] => {
  const hierarchy: { [key: string]: TestItem } = {};
  const topLevelTests: TestItem[] = [];

  testResults.forEach((test) => {
    const { ancestorTitles, title, status } = test;
    const isPassed = status === 'passed';

    if (ancestorTitles.length === 0) {
      topLevelTests.push({
        t: isPassed ? 'passed' : 'failed',
        v: title,
        p: isPassed,
      });
      return;
    }

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

    // Handle nested describes
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

    // Add test to deepest level
    currentLevel.items = currentLevel.items || [];
    currentLevel.items.push({
      t: isPassed ? 'passed' : 'failed',
      v: title,
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

  // Handle top-level tests
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
};

export const formatTypeScriptError = (errorMessage: string): string => {
  const cleanMessage = errorMessage
    .replace(/\x1B\[\d+m/g, '')
    .replace(/\[0m/g, '')
    .replace(/\[2m/g, '')
    .replace(/\[22m/g, '')
    .replace(/●\s+/g, '')
    .trim();

  const lines = cleanMessage.split('\n');
  const relevantLines = lines
    .map((line) => line.trim())
    .filter(
      (line) =>
        line.length > 0 &&
        !line.startsWith('Jest encountered') &&
        !line.includes('npm ERR!') &&
        !line.includes('npm WARN'),
    )
    .map((line) =>
      line.replace(/^(?:in )?[\/\\].*[\\/]([^\/\\]+\.[jt]sx?):/, '$1:'),
    );

  return relevantLines.join('\n');
};

export const createExecutionResponse = (
  jestOutput: JestOutput,
): CodeExecutionResponse => {
  // Handle compilation errors
  if (
    jestOutput.numRuntimeErrorTestSuites > 0 &&
    jestOutput.testResults?.[0]?.message
  ) {
    const errorMessage = formatTypeScriptError(
      jestOutput.testResults[0].message,
    );
    return createErrorResponse(errorMessage, true);
  }

  // Handle no test results
  if (!jestOutput.testResults || jestOutput.testResults.length === 0) {
    return createErrorResponse('No test results found.', false);
  }

  const testResults = jestOutput.testResults[0];
  const passed = testResults.assertionResults.filter(
    (t) => t.status === 'passed',
  ).length;
  const failed = testResults.assertionResults.filter(
    (t) => t.status === 'failed',
  ).length;
  const errors = testResults.assertionResults.filter((t) =>
    ['pending', 'todo', 'disabled'].includes(t.status),
  ).length;

  const testItems = createTestHierarchy(testResults.assertionResults);
  const totalTests = passed + failed + errors;
  const allTestsPassed = passed > 0 && failed === 0 && errors === 0;
  const wallTime = testResults.endTime - testResults.startTime;

  return {
    type: allTestsPassed ? 'execution success' : 'execution error',
    stdout: jestOutput.stdout || '',
    stderr: jestOutput.stderr || '',
    exitCode: allTestsPassed ? 0 : 1,
    wallTime,
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
      unweighted: { passed, failed },
      weighted: { passed, failed },
      timedOut: false,
      wallTime,
      testTime: testResults.assertionResults[0]?.duration || 0,
      tags: null,
    },
  };
};

const createErrorResponse = (
  errorMessage: string,
  isCompilationError: boolean,
): CodeExecutionResponse => ({
  type: 'execution error',
  stdout: '',
  stderr: errorMessage,
  exitCode: 1,
  wallTime: 0,
  timedOut: false,
  message: isCompilationError ? 'Compilation failed' : errorMessage,
  token: '',
  result: {
    serverError: !isCompilationError,
    completed: false,
    output: [],
    successMode: 'assertions',
    passed: 0,
    failed: 1,
    errors: 1,
    error: errorMessage,
    assertions: {
      passed: 0,
      failed: 1,
      hidden: { passed: 0, failed: 0 },
    },
    specs: {
      passed: 0,
      failed: 1,
      hidden: { passed: 0, failed: 0 },
    },
    unweighted: { passed: 0, failed: 1 },
    weighted: { passed: 0, failed: 1 },
    timedOut: false,
    wallTime: 0,
    testTime: 0,
    tags: null,
  },
});
