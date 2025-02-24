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
import { StructuredLogger } from 'src/logger/structured-logger.service';

const TEMPLATE_DIR = join(process.cwd(), 'templates/python');
const logger = new StructuredLogger('PythonExecutor');

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
  collectors: Array<{
    nodeid: string;
    outcome: 'passed' | 'failed';
    longrepr?: string;
  }>;
  summary: PytestSummary;
  stdout: string;
  stderr: string;
  duration: number;
}

export class PythonExecutor implements CodeExecutionStrategy {
  async execute(codePath: string) {
    logger.debug('Starting Python code execution', {
      codePath,
      templateDir: TEMPLATE_DIR,
    });

    try {
      // Execute tests using the pre-configured pytest environment
      const pythonPath = join(TEMPLATE_DIR, 'venv/bin/python');
      const pytestPath = join(TEMPLATE_DIR, 'venv/bin/pytest');

      logger.debug('Running pytest tests', {
        pythonPath,
        pytestPath,
      });

      const execOutput = await exec(codePath, `${pythonPath} ${pytestPath}`);

      logger.debug('Reading test output file');
      const testOutput = await readFile(
        join(codePath, 'test-output.json'),
        'utf8',
      );
      const result = JSON.parse(testOutput) as PytestResult;

      // Check for collection errors
      const collectionError = result.collectors.find(
        (c) => c.outcome === 'failed',
      )?.longrepr;
      if (collectionError) {
        logger.debug('Test collection failed', { collectionError });
        return createErrorResponse(
          execOutput,
          this.cleanErrorStack(collectionError),
          true,
        );
      }

      logger.debug('Test execution completed', {
        totalTests: result.summary.total,
        passedTests: result.summary.passed,
        failedTests: result.summary.failed,
        skippedTests: result.summary.skipped,
        errorTests: result.summary.error,
        duration: result.duration,
        hasOutput: !!result.stdout,
        hasErrors: !!result.stderr,
      });

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
      logger.debug('Test execution failed', {
        errorName: err.name,
        errorMessage: err.message,
        stackTrace: err.stack,
      });

      const errorMessage =
        err instanceof Error ? err.stack || err.message : String(err);
      return createErrorResponse('', errorMessage, true);
    }
  }

  private cleanErrorStack(error: string): string {
    return error
      .split('\n')
      .filter((line) => {
        // Remove pytest internals and Python framework paths
        const isFrameworkLine =
          /(\/_pytest\/|importlib|_bootstrap|site-packages)/.test(line) ||
          line.startsWith('    ???') ||
          /^<.*>:\d+: in /.test(line);

        // Keep user code lines and actual error messages
        const isUserCode =
          /(\/src\/|^E\s+|^Error|^\w+Error:)/.test(line) ||
          line.trim().startsWith('File "');

        return !isFrameworkLine && isUserCode;
      })
      .map(
        (line) =>
          line
            .replace(/^E\s+/, '')
            .replace(/^_+/, '')
            .replace(/\?{3,}/g, '')
            .replace(/at 0x[0-9a-f]+>/, ''), // Remove memory addresses
      )
      .join('\n')
      .trim();
  }
}

export class PythonFileWriter implements FileWriterStrategy {
  private readonly logger = new StructuredLogger('PythonFileWriter');

  async write(filePath: string, files: AlgorithmFile[]): Promise<void> {
    this.logger.debug('Starting Python file setup', {
      filePath,
      templateDir: TEMPLATE_DIR,
      fileCount: files.length,
    });

    try {
      // Set up symlinks for template files and create src directory
      this.logger.debug('Setting up template symlinks');
      await setupTemplateSymlinks(TEMPLATE_DIR, filePath);

      // Write user files to src directory
      const srcDir = join(filePath, 'src');
      this.logger.debug('Writing user files', {
        srcDir,
        files: files.map((f) => ({ name: f.name, size: f.content.length })),
      });

      for (const file of files) {
        await createFile(file, srcDir);
      }

      this.logger.debug('Python file setup completed successfully');
    } catch (error) {
      this.logger.debug('Python file setup failed', {
        errorName: error.name,
        errorMessage: error.message,
        stackTrace: error.stack,
      });
      throw error;
    }
  }
}
