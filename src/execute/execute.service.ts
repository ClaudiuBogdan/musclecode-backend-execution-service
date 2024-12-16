import { Injectable } from '@nestjs/common';
import * as path from 'path';
import { FileService } from './files/file.service';
import { executeCode } from './languages/executor';
import { ExecuteCodeDTO, CodeExecutionResponse } from './interfaces';

@Injectable()
export class ExecuteService {
  constructor(private readonly fileService: FileService) {}

  async execute(payload: ExecuteCodeDTO): Promise<CodeExecutionResponse> {
    const basePath = path.resolve('./dist/code');
    const filesPath = path.join(
      basePath,
      payload.submissionId ? path.basename(payload.submissionId) : 'temp',
    );

    try {
      // Create files and directories
      await this.fileService.createFiles(filesPath, payload);

      // Execute code
      const results = await executeCode(filesPath, payload.language);

      return results;
    } catch (error) {
      console.error('Execution error:', error);
      return {
        type: 'execution error',
        stdout: '',
        stderr:
          error instanceof Error ? error.stack || error.message : String(error),
        exitCode: 1,
        wallTime: 0,
        timedOut: false,
        message: error instanceof Error ? error.message : String(error),
        token: '',
        result: {
          serverError: true,
          completed: false,
          output: [],
          successMode: 'assertions',
          passed: 0,
          failed: 1,
          errors: 1,
          error: error instanceof Error ? error.message : String(error),
          assertions: {
            passed: 0,
            failed: 1,
            hidden: { passed: 0, failed: 0 },
          },
          specs: { passed: 0, failed: 1, hidden: { passed: 0, failed: 0 } },
          unweighted: { passed: 0, failed: 1 },
          weighted: { passed: 0, failed: 1 },
          timedOut: false,
          wallTime: 0,
          testTime: 0,
          tags: null,
        },
      };
    } finally {
      // Clean up files after execution
      await this.fileService.removeDirectory(filesPath);
    }
  }
}
