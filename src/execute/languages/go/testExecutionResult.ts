import { TestItem, CodeExecutionResponse } from '../../interfaces';

interface GoTestResult {
  Package: string;
  Test: string;
  Action: string;
  Output: string;
  Elapsed: number;
  Time: string;
}

interface GoOutput {
  testResults: {
    name: string;
    assertionResults: {
      title: string;
      status: string;
      failureMessages?: string[];
      duration?: number;
    }[];
    startTime: number;
    endTime: number;
    status: string;
  }[];
  numFailedTestSuites: number;
  numFailedTests: number;
  numPassedTestSuites: number;
  numPassedTests: number;
  numTotalTestSuites: number;
  numTotalTests: number;
  numRuntimeErrorTestSuites?: number;
  success: boolean;
  stdout: string;
  stderr: string;
}

export const createTestHierarchy = (
  testResults: GoTestResult[],
): TestItem[] => {
  const hierarchy: { [key: string]: TestItem } = {};

  testResults.forEach((test) => {
    if (!test.Test) return; // Skip package-level entries

    const isPassed = test.Action === 'pass';
    const testName = test.Test;
    const packageName = test.Package;

    if (!hierarchy[packageName]) {
      hierarchy[packageName] = {
        t: 'describe',
        v: packageName,
        p: true,
        items: [],
      };
    }

    hierarchy[packageName].items = hierarchy[packageName].items || [];
    hierarchy[packageName].items.push({
      t: isPassed ? 'passed' : 'failed',
      v: testName,
      p: isPassed,
      error: !isPassed ? test.Output : undefined,
    });

    // Update parent describe block's pass status
    if (!isPassed) {
      hierarchy[packageName].p = false;
    }
  });

  return Object.values(hierarchy);
};

export const createExecutionResponse = (
  result: GoOutput,
): CodeExecutionResponse => {
  const testItems = createTestHierarchy(
    result.testResults.flatMap((tr) =>
      tr.assertionResults.map((ar) => ({
        Package: tr.name,
        Test: ar.title,
        Action: ar.status === 'passed' ? 'pass' : 'fail',
        Output: ar.failureMessages?.join('\n') || '',
        Elapsed: ar.duration || 0,
        Time: new Date(tr.startTime).toISOString(),
      })),
    ),
  );

  const passed = result.numPassedTests;
  const failed = result.numFailedTests;
  const errors = result.numRuntimeErrorTestSuites || 0;
  const totalTests = passed + failed + errors;
  const allTestsPassed = passed > 0 && failed === 0 && errors === 0;

  return {
    type: allTestsPassed ? 'execution success' : 'execution error',
    stdout: result.stdout,
    stderr: result.stderr,
    exitCode: allTestsPassed ? 0 : 1,
    wallTime:
      result.testResults[0]?.endTime - result.testResults[0]?.startTime || 0,
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
      error: result.stderr || null,
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
      wallTime:
        result.testResults[0]?.endTime - result.testResults[0]?.startTime || 0,
      testTime: result.testResults[0]?.assertionResults[0]?.duration || 0,
      tags: null,
    },
  };
};
