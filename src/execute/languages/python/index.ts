import {
  CodeExecutionResponse,
  CodeExecutionStrategy,
  FileWriterStrategy,
} from '../interfaces';
import { FileData, TestData, UserCode } from 'src/execute/interfaces';
import { createFile } from 'src/utils/fs';
import { exec } from 'src/utils/exec';

export class PythonExecutor implements CodeExecutionStrategy {
  async execute(codePath: string): Promise<CodeExecutionResponse> {
    const output = await exec(
      codePath,
      `/opt/venv/bin/pytest --json-report --json-report-file=report.json .  > /dev/null 2>&1 ; cat report.json`,
    );
    const pytestOutput = JSON.parse(output);

    const results = pytestOutput.tests.map((test) => {
      return {
        id: test.nodeid.replace(), // TODO get last id
        passed: test.outcome === 'passed',
        error: test.outcome === 'failed' ? test.call.longrepr : undefined,
      };
    });

    const error = results.find((result) => result.outcome === 'failed')?.call
      ?.longrepr;

    return { results, error };
  }
}

export class PythonFileWriter implements FileWriterStrategy {
  async write(
    filePath: string,
    userCode: UserCode,
    test: TestData,
  ): Promise<void> {
    const testFile: FileData = test.args
      .map(
        ({ id, arg, expected }) =>
          `def test_${id}():\n` +
          `    assert ${userCode.functionName}(${arg}) == ${expected}\n`,
      )
      .reduce(
        (acc, curr) => {
          acc.content += `${curr}\n`;
          return acc;
        },
        {
          id: test.id,
          filename: test.id.replace(/[^a-zA-Z0-9]/g, '_') + '_test',
          extension: 'py',
          content: `from ${userCode.file.filename} import ${userCode.functionName}\n`,
        },
      );

    const customTests = test.customTests || [];

    const pytestConfig: FileData = {
      id: 'pytest-config',
      filename: 'pytest',
      extension: 'ini',
      content: '[pytest]\npython_files = *_test.py\n',
    };

    // Write files to the disk
    const files = [pytestConfig, userCode.file, testFile, ...customTests];
    await Promise.all(files.map((file) => createFile(file, filePath)));
  }
}
