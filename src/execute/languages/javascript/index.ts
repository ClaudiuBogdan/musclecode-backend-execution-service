import { CodeExecutionStrategy, FileWriterStrategy } from '../interfaces';
import { createFile, setupTemplateSymlinks } from 'src/utils/fs';
import { exec } from 'src/utils/exec';
import { createExecutionResponse } from '../typescript/testExecutionResult';
import { AlgorithmFile } from 'src/execute/interfaces';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { StructuredLogger } from 'src/logger/structured-logger.service';

const TEMPLATE_DIR = join(process.cwd(), 'templates/javascript');
const logger = new StructuredLogger('JavaScriptExecutor');

export class JavaScriptExecutor implements CodeExecutionStrategy {
  async execute(codePath: string) {
    logger.debug('Starting JavaScript code execution', {
      codePath,
      templateDir: TEMPLATE_DIR,
    });

    try {
      logger.debug('Running Vitest tests');
      await exec(codePath, 'npx vitest run --reporter json');

      logger.debug('Reading test output file');
      const vitestOutput = JSON.parse(
        await readFile(join(codePath, 'test-output.json'), 'utf8'),
      );

      logger.debug('Processing test results', {
        numTestSuites: vitestOutput.numTotalTestSuites,
        numTests: vitestOutput.numTotalTests,
        success: vitestOutput.success,
      });

      // Transform the Jest output to match the expected structure
      const transformedOutput = {
        testResults: vitestOutput.testResults.map((result) => ({
          assertionResults: result.assertionResults,
          startTime: result.startTime,
          endTime: result.endTime,
          message: result.message,
          status: result.status,
          name: result.name,
          console: result.console || [],
        })),
        numFailedTestSuites: vitestOutput.numFailedTestSuites,
        numFailedTests: vitestOutput.numFailedTests,
        numPassedTestSuites: vitestOutput.numPassedTestSuites,
        numPassedTests: vitestOutput.numPassedTests,
        numPendingTestSuites: vitestOutput.numPendingTestSuites,
        numPendingTests: vitestOutput.numPendingTests,
        numRuntimeErrorTestSuites: vitestOutput.numRuntimeErrorTestSuites,
        numTotalTestSuites: vitestOutput.numTotalTestSuites,
        numTotalTests: vitestOutput.numTotalTests,
        success: vitestOutput.success,
        stdout: vitestOutput.stdout || '',
        stderr:
          vitestOutput.stderr || vitestOutput.testResults[0]?.message || '',
        consoleOutput: vitestOutput.testResults
          .flatMap((result) => result.console || [])
          .map((entry) => ({
            type: entry.type,
            message: entry.message,
            origin: entry.origin,
          })),
      };

      logger.debug('Test execution completed', {
        failedTests: transformedOutput.numFailedTests,
        passedTests: transformedOutput.numPassedTests,
        totalTests: transformedOutput.numTotalTests,
        hasConsoleOutput: transformedOutput.consoleOutput.length > 0,
        success: transformedOutput.success,
      });

      return createExecutionResponse(transformedOutput);
    } catch (err) {
      logger.debug('Test execution failed', {
        errorName: err.name,
        errorMessage: err.message,
        stackTrace: err.stack,
      });

      return createExecutionResponse({
        testResults: [
          {
            message:
              err instanceof Error ? err.stack || err.message : String(err),
            assertionResults: [],
            startTime: 0,
            endTime: 0,
            status: 'failed',
            name: 'Runtime Error',
          },
        ],
        numFailedTestSuites: 1,
        numFailedTests: 0,
        numPassedTestSuites: 0,
        numPassedTests: 0,
        numTotalTestSuites: 1,
        numTotalTests: 0,
        numRuntimeErrorTestSuites: 1,
        success: false,
        stdout: '',
        stderr: err instanceof Error ? err.stack || err.message : String(err),
      });
    }
  }
}

export class JavaScriptFileWriter implements FileWriterStrategy {
  private readonly logger = new StructuredLogger('JavaScriptFileWriter');

  async write(filePath: string, files: AlgorithmFile[]): Promise<void> {
    this.logger.debug('Starting JavaScript file setup', {
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

      this.logger.debug('JavaScript file setup completed successfully');
    } catch (error) {
      this.logger.debug('JavaScript file setup failed', {
        errorName: error.name,
        errorMessage: error.message,
        stackTrace: error.stack,
      });
      throw error;
    }
  }
}
