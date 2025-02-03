import { Injectable } from '@nestjs/common';
import * as path from 'path';
import { FileService } from './files/file.service';
import { executeCode } from './languages/executor';
import { ExecuteCodeDTO, CodeExecutionResponse } from './interfaces';
import { StructuredLogger } from 'src/logger/structured-logger.service';

@Injectable()
export class ExecuteService {
  private logger: StructuredLogger;

  constructor(
    private readonly fileService: FileService,
    logger: StructuredLogger,
  ) {
    this.logger = logger.child({ context: 'ExecuteService' });
  }

  async execute(
    payload: ExecuteCodeDTO,
    userId: string,
  ): Promise<CodeExecutionResponse> {
    const logger = this.logger.child({
      userId,
      algorithmId: payload.algorithmId,
      language: payload.language,
    });

    // Use process.cwd() to get the current working directory in both environments
    const basePath = path.join(process.cwd(), 'code');
    const filesPath = path.join(
      basePath,
      userId,
      payload.algorithmId ? path.basename(payload.algorithmId) : 'temp',
    );

    logger.log(`Setting up execution environment`, {
      filesPath,
    });

    try {
      const startTime = process.hrtime();

      // Create files and directories
      logger.log('Creating execution files');
      await this.fileService.createFiles(filesPath, payload);

      // Execute code
      logger.log('Starting code execution');
      const results = await executeCode(filesPath, payload.language);

      const [seconds, nanoseconds] = process.hrtime(startTime);
      const totalTimeMs = (seconds * 1000 + nanoseconds / 1e6).toFixed(2);

      logger.log(`Code execution completed.`, {
        exitCode: results.exitCode,
        timedOut: results.timedOut,
        wallTime: results.wallTime,
        totalTimeMs,
      });

      return results;
    } catch (error) {
      logger.error('Execution failed', error.stack);

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
      logger.log('Cleaning up execution environment');
      await this.fileService.removeDirectory(filesPath);
    }
  }
}
