import { TestItem, CodeExecutionResponse } from 'src/execute/interfaces';

interface PytestAssertionResult {
  nodeid: string;
  outcome: 'passed' | 'failed' | 'skipped' | 'xfailed' | 'xpassed';
  duration?: number;
  call?: {
    longrepr?: string;
  };
}

interface PytestOutput {
  tests: PytestAssertionResult[];
  summary: {
    passed: number;
    failed: number;
    error: number;
    skipped: number;
  };
  duration: number;
  stdout?: string;
  stderr?: string;
}

export const createTestHierarchy = (
  tests: PytestAssertionResult[],
): TestItem[] => {
  const hierarchy: { [key: string]: TestItem } = {};
  const topLevelTests: TestItem[] = [];

  tests.forEach((test) => {
    const nodePath = test.nodeid.split('::');
    const testTitle = nodePath[nodePath.length - 1];
    const isPassed = test.outcome === 'passed';
    const ancestorTitles = nodePath.slice(0, -1);

    // Handle top-level tests (no describe blocks)
    if (ancestorTitles.length === 0) {
      topLevelTests.push({
        t: isPassed ? 'passed' : 'failed',
        v: testTitle,
        p: isPassed,
        error:
          !isPassed && test.call?.longrepr ? test.call.longrepr : undefined,
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
      error: !isPassed && test.call?.longrepr ? test.call.longrepr : undefined,
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
};

export const createExecutionResponse = (
  pytestOutput: string,
  parsedOutput: PytestOutput,
): CodeExecutionResponse => {
  const passed = parsedOutput.summary.passed || 0;
  const failed = parsedOutput.summary.failed || 0;
  const errors = parsedOutput.summary.error || 0;
  const totalTests = passed + failed + errors;
  const allTestsPassed = passed > 0 && failed === 0 && errors === 0;

  const testItems = createTestHierarchy(parsedOutput.tests);

  return {
    type: allTestsPassed ? 'execution success' : 'execution error',
    stdout: pytestOutput,
    stderr: parsedOutput.stderr || '',
    exitCode: allTestsPassed ? 0 : 1,
    wallTime: parsedOutput.duration * 1000,
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
      wallTime: parsedOutput.duration * 1000,
      testTime: parsedOutput.duration * 1000,
      tags: null,
    },
  };
};

export const createErrorResponse = (
  pytestOutput: string,
  errorMessage: string,
  isServerError: boolean = false,
): CodeExecutionResponse => ({
  type: 'execution error',
  stdout: pytestOutput,
  stderr: errorMessage,
  exitCode: 1,
  wallTime: 0,
  timedOut: false,
  message: errorMessage,
  token: '',
  result: {
    serverError: isServerError,
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
    specs: { passed: 0, failed: 1, hidden: { passed: 0, failed: 0 } },
    unweighted: { passed: 0, failed: 1 },
    weighted: { passed: 0, failed: 1 },
    timedOut: false,
    wallTime: 0,
    testTime: 0,
    tags: null,
  },
});
