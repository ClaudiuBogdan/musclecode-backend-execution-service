import {
  createTestHierarchy,
  formatTypeScriptError,
  createExecutionResponse,
} from './testExecutionResult';

describe('createTestHierarchy', () => {
  it('should handle top-level tests', () => {
    const testResults = [
      { ancestorTitles: [], title: 'test 1', status: 'passed' as const },
      { ancestorTitles: [], title: 'test 2', status: 'failed' as const },
    ];

    const hierarchy = createTestHierarchy(testResults);
    expect(hierarchy).toHaveLength(1);
    expect(hierarchy[0]).toEqual({
      t: 'describe',
      v: 'Tests',
      p: false,
      items: [
        { t: 'passed', v: 'test 1', p: true },
        { t: 'failed', v: 'test 2', p: false },
      ],
    });
  });

  it('should handle nested describe blocks', () => {
    const testResults = [
      {
        ancestorTitles: ['Parent', 'Child'],
        title: 'test 1',
        status: 'passed' as const,
      },
      {
        ancestorTitles: ['Parent', 'Child'],
        title: 'test 2',
        status: 'failed' as const,
      },
    ];

    const hierarchy = createTestHierarchy(testResults);
    expect(hierarchy).toHaveLength(1);
    expect(hierarchy[0]).toEqual({
      t: 'describe',
      v: 'Parent',
      p: false,
      items: [
        {
          t: 'describe',
          v: 'Child',
          p: false,
          items: [
            { t: 'passed', v: 'test 1', p: true },
            { t: 'failed', v: 'test 2', p: false },
          ],
        },
      ],
    });
  });

  it('should handle mixed top-level and nested tests', () => {
    const testResults = [
      { ancestorTitles: [], title: 'top test', status: 'passed' as const },
      {
        ancestorTitles: ['Parent'],
        title: 'nested test',
        status: 'passed' as const,
      },
    ];

    const hierarchy = createTestHierarchy(testResults);
    expect(hierarchy).toHaveLength(2);
    expect(hierarchy).toContainEqual({
      t: 'describe',
      v: 'Tests',
      p: true,
      items: [{ t: 'passed', v: 'top test', p: true }],
    });
    expect(hierarchy).toContainEqual({
      t: 'describe',
      v: 'Parent',
      p: true,
      items: [{ t: 'passed', v: 'nested test', p: true }],
    });
  });
});

describe('formatTypeScriptError', () => {
  it('should clean ANSI codes and format error message', () => {
    const input =
      '\x1B[31mError: Test failed\x1B[0m\n● Some error\n[2mnpm ERR! test failed[22m';
    const formatted = formatTypeScriptError(input);
    expect(formatted).toBe('Error: Test failed');
  });

  it('should handle file paths in error messages', () => {
    const input = 'in /Users/test/project/src/file.ts: Type error';
    const formatted = formatTypeScriptError(input);
    expect(formatted).toBe('file.ts: Type error');
  });
});

describe('createExecutionResponse', () => {
  it('should handle successful test execution', () => {
    const jestOutput = {
      testResults: [
        {
          assertionResults: [
            { ancestorTitles: [], title: 'test 1', status: 'passed' as const },
          ],
          startTime: 1000,
          endTime: 2000,
        },
      ],
      stdout: 'Test output',
    };

    const response = createExecutionResponse(jestOutput);
    expect(response.type).toBe('execution success');
    expect(response.exitCode).toBe(0);
    expect(response.result.passed).toBe(1);
    expect(response.result.failed).toBe(0);
  });

  it('should handle compilation errors', () => {
    const jestOutput = {
      testResults: [
        {
          assertionResults: [],
          startTime: 0,
          endTime: 0,
          message: 'TypeScript error: Cannot find name "test"',
        },
      ],
      numRuntimeErrorTestSuites: 1,
    };

    const response = createExecutionResponse(jestOutput);
    expect(response.type).toBe('execution error');
    expect(response.message).toBe('Compilation failed');
    expect(response.result.serverError).toBe(false);
  });

  it('should handle no test results', () => {
    const jestOutput = {
      testResults: [],
    };

    const response = createExecutionResponse(jestOutput);
    expect(response.type).toBe('execution error');
    expect(response.message).toBe('No test results found.');
    expect(response.result.serverError).toBe(true);
  });

  it('should handle mixed test results', () => {
    const jestOutput = {
      testResults: [
        {
          assertionResults: [
            { ancestorTitles: [], title: 'test 1', status: 'passed' as const },
            { ancestorTitles: [], title: 'test 2', status: 'failed' as const },
            { ancestorTitles: [], title: 'test 3', status: 'todo' as const },
          ],
          startTime: 1000,
          endTime: 2000,
        },
      ],
    };

    const response = createExecutionResponse(jestOutput);
    expect(response.type).toBe('execution error');
    expect(response.result.passed).toBe(1);
    expect(response.result.failed).toBe(1);
    expect(response.result.errors).toBe(1);
  });
});
