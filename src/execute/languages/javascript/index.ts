import { CodeExecutionStrategy, FileWriterStrategy } from '../interfaces';
import { createFile, setupTemplateSymlinks } from 'src/utils/fs';
import { exec } from 'src/utils/exec';
import { createExecutionResponse } from '../typescript/testExecutionResult';
import { AlgorithmFile } from 'src/execute/interfaces';
import { readFile } from 'fs/promises';
import { join } from 'path';

const TEMPLATE_DIR = join(process.cwd(), 'templates/javascript');

export class JavaScriptExecutor implements CodeExecutionStrategy {
  async execute(codePath: string) {
    try {
      await exec(codePath, 'npx vitest run --reporter json');
      const vitestOutput = JSON.parse(
        await readFile(join(codePath, 'test-output.json'), 'utf8'),
      );

      // Transform the Jest output to match the expected structure
      const transformedOutput = {
        testResults: vitestOutput.testResults.map((result) => ({
          assertionResults: result.assertionResults,
          startTime: result.startTime,
          endTime: result.endTime,
          message: result.message,
          status: result.status,
          name: result.name,
          console: result.console || [], // Include console output from test results
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
          vitestOutput.stderr || vitestOutput.testResults[0]?.message || '', // Include test result message in stderr
        // Aggregate all console output from test results
        consoleOutput: vitestOutput.testResults
          .flatMap((result) => result.console || [])
          .map((entry) => ({
            type: entry.type,
            message: entry.message,
            origin: entry.origin,
          })),
      };

      return createExecutionResponse(transformedOutput);
    } catch (err) {
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
