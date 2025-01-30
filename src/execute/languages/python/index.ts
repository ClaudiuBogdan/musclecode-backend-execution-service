import { CodeExecutionStrategy, FileWriterStrategy } from '../interfaces';
import { createFile, setupTemplateSymlinks } from 'src/utils/fs';
import { exec } from 'src/utils/exec';
import { AlgorithmFile } from 'src/execute/interfaces';
import { readFile } from 'fs/promises';
import { join } from 'path';
import {
  createExecutionResponse,
  createErrorResponse,
} from './testExecutionResult';

const TEMPLATE_DIR = join(process.cwd(), 'templates/python');

interface PytestTest {
  name: string;
  outcome: 'passed' | 'failed' | 'skipped' | 'xfailed' | 'xpassed';
  duration: number;
  call?: {
    longrepr?: string;
  };
  nodeid: string;
  start: string;
  stop: string;
}

interface PytestSummary {
  failed: number;
  passed: number;
  skipped: number;
  error: number;
  total: number;
}

interface PytestResult {
  tests: PytestTest[];
  summary: PytestSummary;
  stdout: string;
  stderr: string;
  duration: number;
}

export class PythonExecutor implements CodeExecutionStrategy {
  async execute(codePath: string) {
    try {
      // Execute tests using the pre-configured pytest environment
      const pythonPath = join(TEMPLATE_DIR, 'venv/bin/python');
      const pytestPath = join(TEMPLATE_DIR, 'venv/bin/pytest');

      const execOutput = await exec(codePath, `${pythonPath} ${pytestPath}`);
      const testOutput = await readFile(
        join(codePath, 'test-output.json'),
        'utf8',
      );
      const result = JSON.parse(testOutput) as PytestResult;

      // Transform the test results to match our format
      return createExecutionResponse(execOutput, {
        tests: result.tests.map((test) => ({
          nodeid: test.nodeid,
          outcome: test.outcome,
          duration: test.duration,
          call: test.call,
        })),
        summary: {
          passed: result.summary.passed,
          failed: result.summary.failed,
          error: result.summary.error,
          skipped: result.summary.skipped,
        },
        duration: result.duration || 0,
        stdout: result.stdout,
        stderr: result.stderr,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.stack || err.message : String(err);
      return createErrorResponse('', errorMessage, true);
    }
  }
}

export class PythonFileWriter implements FileWriterStrategy {
  async write(filePath: string, files: AlgorithmFile[]): Promise<void> {
    // Set up symlinks for template files and create src directory
    await setupTemplateSymlinks(TEMPLATE_DIR, filePath);

    // Write user files to src directory
    const srcDir = join(filePath, 'src');
    for (const file of files) {
      await createFile(file, srcDir);
    }
  }
}
