import { CodeExecutionStrategy, FileWriterStrategy } from '../interfaces';
import { createFile, setupTemplateSymlinks } from 'src/utils/fs';
import { exec } from 'src/utils/exec';
import { createExecutionResponse } from './testExecutionResult';
import { AlgorithmFile } from 'src/execute/interfaces';
import { readFile } from 'fs/promises';
import { join } from 'path';

const TEMPLATE_DIR = join(process.cwd(), 'templates/typescript');

export class TypeScriptExecutor implements CodeExecutionStrategy {
  async execute(codePath: string) {
    try {
      // No need to install dependencies as they are already in the template
      await exec(
        codePath,
        'npx vitest run --reporter json --outputFile=./test-output.json',
      );
      const vitestOutput = JSON.parse(
        await readFile(join(codePath, 'test-output.json'), 'utf8'),
      );

      return createExecutionResponse(vitestOutput);
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

export class TypeScriptFileWriter implements FileWriterStrategy {
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
