import { CodeExecutionStrategy, FileWriterStrategy } from '../interfaces';
import { createFile, setupTemplateSymlinks } from 'src/utils/fs';
import { exec } from 'src/utils/exec';
import { createExecutionResponse } from './testExecutionResult';
import { AlgorithmFile } from 'src/execute/interfaces';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { StructuredLogger } from 'src/logger/structured-logger.service';

const TEMPLATE_DIR = join(process.cwd(), 'templates/typescript');
const logger = new StructuredLogger('TypeScriptExecutor');

export class TypeScriptExecutor implements CodeExecutionStrategy {
  async execute(codePath: string) {
    logger.debug('Starting TypeScript code execution', {
      codePath,
      templateDir: TEMPLATE_DIR,
    });

    try {
      logger.debug('Running Vitest tests');
      const output = await exec(
        codePath,
        'npx vitest run --config=vitest.config.ts --reporter=json --outputFile=/dev/stdout',
      );
      logger.debug('Reading test output file');
      const vitestOutput = JSON.parse(output);
      logger.debug('Test execution completed', {
        numTestSuites: vitestOutput.numTotalTestSuites,
        numTests: vitestOutput.numTotalTests,
        success: vitestOutput.success,
        vitestOutput,
      });

      return createExecutionResponse(vitestOutput);
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

export class TypeScriptFileWriter implements FileWriterStrategy {
  private readonly logger = new StructuredLogger('TypeScriptFileWriter');

  async write(filePath: string, files: AlgorithmFile[]): Promise<void> {
    this.logger.debug('Starting TypeScript file setup', {
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

      this.logger.debug('TypeScript file setup completed successfully');
    } catch (error) {
      this.logger.debug('TypeScript file setup failed', {
        errorName: error.name,
        errorMessage: error.message,
        stackTrace: error.stack,
      });
      throw error;
    }
  }
}
