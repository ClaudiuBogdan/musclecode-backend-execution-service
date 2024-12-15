import { CodeExecutionStrategy, FileWriterStrategy } from '../interfaces';
import { createFile } from 'src/utils/fs';
import { exec } from 'src/utils/exec';
import { CodeExecutionResponse, TestItem } from 'src/execute/interfaces';

export class PythonExecutor implements CodeExecutionStrategy {
  async execute(codePath: string): Promise<CodeExecutionResponse> {
    try {
      // Create a virtual environment if it doesn't exist
      await exec(codePath, 'python3 -m venv venv || true');

      // Install pytest and required packages
      await exec(codePath, './venv/bin/pip install pytest pytest-json-report');

      const execOutput = await exec(
        codePath,
        `./venv/bin/python -m pytest --json-report --json-report-file=report.json . > /dev/null 2>&1 && cat report.json`,
      );
      const pytestOutput = JSON.parse(execOutput);

      if (!pytestOutput.tests || pytestOutput.tests.length === 0) {
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

      const passed = pytestOutput.summary.passed || 0;
      const failed = pytestOutput.summary.failed || 0;
      const errors = pytestOutput.summary.error || 0;

      const testItems: TestItem[] = pytestOutput.tests.map((test) => ({
        t: test.outcome === 'passed' ? 'passed' : 'failed',
        v: test.name,
        p: test.outcome === 'passed',
        items: test.nodeid
          .split('::')
          .slice(0, -1)
          .map((title) => ({
            t: 'describe',
            v: title,
            p: true,
          })),
      }));

      return {
        type:
          failed === 0 && errors === 0
            ? 'execution success'
            : 'execution error',
        stdout: pytestOutput.stdout || '',
        stderr: pytestOutput.stderr || '',
        exitCode: failed === 0 && errors === 0 ? 0 : 1,
        wallTime: pytestOutput.duration * 1000 || 0,
        timedOut: false,
        message:
          failed === 0 && errors === 0
            ? 'All tests passed'
            : 'Some tests failed',
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
          wallTime: pytestOutput.duration * 1000 || 0,
          testTime: pytestOutput.duration * 1000 || 0,
          tags: null,
        },
      };
    } catch (err) {
      console.error('Error executing pytest:', err);
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

export class PythonFileWriter implements FileWriterStrategy {
  async write(filePath: string, code: string): Promise<void> {
    // Write the main code file
    await createFile(
      {
        id: 'main',
        filename: 'main',
        extension: 'py',
        content: code,
      },
      filePath,
    );

    // Write pytest config
    await createFile(
      {
        id: 'pytest-config',
        filename: 'pytest',
        extension: 'ini',
        content: `[pytest]
python_files = test_*.py *_test.py
python_functions = test_*
python_classes = Test*
addopts = -v --json-report
`,
      },
      filePath,
    );

    // Write conftest.py for pytest configuration
    await createFile(
      {
        id: 'conftest',
        filename: 'conftest',
        extension: 'py',
        content: `import pytest
import sys
import os

# Add the current directory to Python path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))
`,
      },
      filePath,
    );
  }
}
