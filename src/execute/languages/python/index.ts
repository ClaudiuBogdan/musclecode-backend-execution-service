import { CodeExecutionStrategy, FileWriterStrategy } from '../interfaces';
import { createFile } from 'src/utils/fs';
import { exec } from 'src/utils/exec';
import { CodeExecutionResponse } from 'src/execute/interfaces';
import {
  createExecutionResponse,
  createErrorResponse,
} from './testExecutionResult';

export class PythonExecutor implements CodeExecutionStrategy {
  async execute(codePath: string): Promise<CodeExecutionResponse> {
    try {
      // Create a virtual environment if it doesn't exist
      await exec(codePath, 'python3 -m venv venv || true');

      // Install pytest and required packages
      await exec(codePath, './venv/bin/pip install pytest pytest-json-report');

      try {
        // First, run the code directly to capture stdout
        // TODO: fix this. It not calling the main function and the tests. Another approach needed
        //         const userOutput = await exec(
        //           codePath,
        //           `./venv/bin/python -c "
        // import sys
        // sys.path.append('.')
        // from test_main import *
        // # The code has been imported and any top-level print statements have been executed
        // "`,
        //         );

        // Then run pytest to check for syntax errors and collect tests
        const collectOutput = await exec(
          codePath,
          `./venv/bin/python -m pytest --verbose --collect-only .`,
        );

        // If the output contains a syntax error, return it
        if (
          collectOutput.includes('SyntaxError') ||
          collectOutput.includes('IndentationError')
        ) {
          // Extract the error message from the pytest output
          const errorLines = collectOutput
            .split('\n')
            .filter(
              (line) =>
                line.includes('Error') ||
                line.includes('test_main.py') ||
                line.includes('    ') || // Include indented lines which often contain the error pointer (^)
                line.trim().startsWith('^'), // Include the error pointer line
            )
            .join('\n');

          return createErrorResponse(collectOutput, errorLines, false);
        }

        // If no tests were collected (but no syntax error), return with test discovery message
        if (collectOutput.includes('no tests collected')) {
          return createErrorResponse(
            collectOutput,
            'No test files found. Make sure your test files start with "test_" or end with "_test.py" and test functions start with "test_".',
            false,
          );
        }

        // If tests were found and no syntax errors, run them and generate the report
        await exec(
          codePath,
          `./venv/bin/python -m pytest --json-report --json-report-file=report.json .`,
        );

        const reportContent = await exec(codePath, 'cat report.json');
        console.log('Report content:', reportContent);

        try {
          const parsedOutput = JSON.parse(reportContent);

          if (!parsedOutput.tests || parsedOutput.tests.length === 0) {
            return createErrorResponse(
              '',
              'No test results found. Make sure your test files start with "test_" or end with "_test.py" and test functions start with "test_".',
              false,
            );
          }

          // TODO: add output here
          return createExecutionResponse('', parsedOutput);
        } catch (parseError) {
          console.error('Failed to parse pytest output:', parseError);
          console.error('Raw report content:', reportContent);
          return createErrorResponse(
            '',
            'Failed to parse test results: ' + String(parseError),
            true,
          );
        }
      } catch (err) {
        console.error('Error executing tests:', err);
        return createErrorResponse(
          '',
          err instanceof Error ? err.stack || err.message : String(err),
          true,
        );
      }
    } catch (err) {
      console.error('Error executing tests:', err);
      return createErrorResponse(
        '',
        err instanceof Error ? err.stack || err.message : String(err),
        true,
      );
    }
  }
}

export class PythonFileWriter implements FileWriterStrategy {
  async write(filePath: string, code: string): Promise<void> {
    // Write the main code file
    await createFile(
      {
        id: 'main',
        filename: 'test_main',
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
addopts = --json-report
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
