import { FileData, TestData, UserCode } from 'src/execute/interfaces';
import {
  CodeExecutionResponse,
  CodeExecutionStrategy,
  FileWriterStrategy,
} from '../interfaces';
import { createFile } from 'src/utils/fs';
import jestConfig from './jest.config';
import { exec } from 'src/utils/exec';

export class JavaScriptExecutor implements CodeExecutionStrategy {
  async execute(codePath: string): Promise<CodeExecutionResponse> {
    try {
      const output = await exec(codePath, 'jest --json');
      const jestOutput = JSON.parse(output);

      if (!jestOutput.testResults || jestOutput.testResults.length === 0) {
        return {
          results: [],
          passed: false,
          error: 'No test results found or compilation failed.',
        };
      }

      const results = jestOutput.testResults.flatMap((testResult) =>
        testResult.assertionResults.map((test) => ({
          id: test.fullName,
          passed: test.status === 'passed',
          error:
            test.status === 'failed'
              ? test.failureDetails[0]?.matcherResult?.message
              : undefined,
        })),
      );
      const passed = !results.some((result) => !result.passed);
      const error = jestOutput.testResults[0]?.message || undefined;
      return { results, passed, error };
    } catch (err) {
      console.error('Error executing jest:', err);
      return { results: [], passed: false, error: err.message };
    }
  }
}
export class JavaScriptFileWriter implements FileWriterStrategy {
  async write(
    filePath: string,
    userCode: UserCode,
    test: TestData,
  ): Promise<void> {
    const importFn = `const ${userCode.functionName} = require('./${userCode.file.filename}');`;
    const exportFn = `module.exports = ${userCode.functionName}`;

    const userFile: FileData = {
      ...userCode.file,
      content: `${userCode.file.content}\n${exportFn}`,
    };

    const testFile: FileData = test.args
      .map(
        ({ id, arg, expected }) =>
          `test('${id}', () => {\n` +
          `  expect(${userCode.functionName}(${arg})).toEqual(${expected});\n` +
          `});`,
      )
      .reduce(
        (acc, curr) => {
          acc.content += `${curr}\n`;
          return acc;
        },
        {
          id: test.id,
          filename: test.id,
          extension: 'test.js',
          content: `${importFn}\n`, // Add import statement
        },
      );

    const customTests =
      test.customTests.map((file) => ({
        ...file,
        content: `${importFn}\n${file.content}`,
      })) || [];

    const jestConfigFile: FileData = {
      id: 'jest-config',
      filename: 'jest.config',
      extension: 'js',
      content: jestConfig,
    };

    // Write files to the disk
    const files = [jestConfigFile, userFile, testFile, ...customTests];
    await Promise.all(files.map((file) => createFile(file, filePath)));
  }
}
