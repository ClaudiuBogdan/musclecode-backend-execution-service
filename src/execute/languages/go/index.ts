import { CodeExecutionStrategy, FileWriterStrategy } from '../interfaces';
import { createFile } from 'src/utils/fs';
import { exec } from 'src/utils/exec';
import { createExecutionResponse } from './testExecutionResult';
import { AlgorithmFile } from 'src/execute/interfaces';

export class GoExecutor implements CodeExecutionStrategy {
  async execute(codePath: string) {
    try {
      // Run go test with JSON output and verbose flag for detailed test output
      const testResult = await exec(codePath, 'go test -v -json ./...');
      const testLines = testResult.split('\n').filter((line) => line.trim());
      const testOutput = testLines.map((line) => JSON.parse(line));

      // Group test results by package and test name, only keeping the final result
      const packageResults = new Map();
      const processedTests = new Map(); // Track processed test names and their outputs

      testOutput.forEach((result) => {
        // Initialize package if not exists
        if (!packageResults.has(result.Package)) {
          packageResults.set(result.Package, {
            name: result.Package,
            assertionResults: [],
            startTime: new Date(result.Time).getTime(),
            endTime: new Date(result.Time).getTime(),
            status: 'passed',
          });
        }

        const pkg = packageResults.get(result.Package);
        const testKey = `${result.Package}:${result.Test}`;

        // Skip if this is a parent test and has subtests
        const isParentTest = result.Test && !result.Test.includes('/');
        const hasSubtests = testOutput.some(
          (t) => t.Test && t.Test.startsWith(`${result.Test}/`),
        );
        if (isParentTest && hasSubtests) {
          return;
        }

        // Collect test output for error messages
        if (result.Test && result.Output) {
          const currentOutput = processedTests.get(testKey)?.output || [];
          processedTests.set(testKey, {
            ...processedTests.get(testKey),
            output: [...currentOutput, result.Output],
          });
        }

        // Only process test results with Action "pass" or "fail" to avoid duplicates
        if (
          result.Test &&
          (result.Action === 'pass' || result.Action === 'fail') &&
          !processedTests.get(testKey)?.processed
        ) {
          processedTests.set(testKey, {
            ...processedTests.get(testKey),
            processed: true,
            status: result.Action,
          });

          const testOutput = processedTests.get(testKey)?.output || [];
          pkg.assertionResults.push({
            title: result.Test,
            status: result.Action === 'pass' ? 'passed' : 'failed',
            failureMessages: result.Action === 'fail' ? testOutput : [],
            duration: result.Elapsed * 1000,
          });

          if (result.Action === 'fail') {
            pkg.status = 'failed';
          }
          pkg.endTime = Math.max(
            pkg.endTime,
            new Date(result.Time).getTime() + result.Elapsed * 1000,
          );
        }
      });

      // Filter out package-level events and collect stdout/stderr
      const stdout: string[] = [];
      const stderr: string[] = [];
      testOutput.forEach((result) => {
        if (result.Output) {
          if (result.Action === 'fail' && !result.Test) {
            stderr.push(result.Output);
          } else if (!result.Test || result.Action === 'output') {
            stdout.push(result.Output);
          }
        }
      });

      const transformedOutput = {
        testResults: Array.from(packageResults.values()),
        numFailedTestSuites: Array.from(packageResults.values()).filter(
          (p) => p.status === 'failed',
        ).length,
        numFailedTests: Array.from(processedTests.values()).filter(
          (test) => test.status === 'fail',
        ).length,
        numPassedTestSuites: Array.from(packageResults.values()).filter(
          (p) => p.status === 'passed',
        ).length,
        numPassedTests: Array.from(processedTests.values()).filter(
          (test) => test.status === 'pass',
        ).length,
        numTotalTestSuites: packageResults.size,
        numTotalTests: processedTests.size,
        success: !Array.from(processedTests.values()).some(
          (test) => test.status === 'fail',
        ),
        stdout: stdout.join('\n'),
        stderr: stderr.join('\n'),
      };

      return createExecutionResponse(transformedOutput);
    } catch (err) {
      return createExecutionResponse({
        testResults: [
          {
            name: 'Runtime Error',
            assertionResults: [],
            startTime: Date.now(),
            endTime: Date.now(),
            status: 'failed',
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

export class GoFileWriter implements FileWriterStrategy {
  async write(filePath: string, files: AlgorithmFile[]): Promise<void> {
    // Initialize Go module
    await exec(filePath, 'go mod init code-execution');

    // Write user files
    for (const file of files) {
      if (file.name === 'test') {
        // _test.go is the convention for test files in Go
        file.name = 'test_test';
      }
      await createFile(file, filePath);
    }

    // Write go.mod file with required dependencies
    await createFile(
      {
        id: 'go-mod',
        name: 'go',
        extension: 'mod',
        content: `module code-execution

go 1.21
`,
      },
      filePath,
    );
  }
}
