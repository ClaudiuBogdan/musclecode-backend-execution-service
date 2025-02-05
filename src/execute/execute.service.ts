import { Injectable } from '@nestjs/common';
import * as path from 'path';
import { FileService } from './files/file.service';
import { executeCode } from './languages/executor';
import { ExecuteCodeDTO, CodeExecutionResponse } from './interfaces';
import { StructuredLogger } from 'src/logger/structured-logger.service';

@Injectable()
export class ExecuteService {
  private readonly logger = new StructuredLogger('ExecuteService');
  constructor(private readonly fileService: FileService) {}

  async execute(
    payload: ExecuteCodeDTO,
    userId: string,
  ): Promise<CodeExecutionResponse> {
    const basePath = path.join(process.cwd(), 'code');
    const filesPath = path.join(
      basePath,
      userId,
      payload.algorithmId ? path.basename(payload.algorithmId) : 'temp',
    );

    this.logger.debug('Initializing execution environment', {
      userId,
      algorithmId: payload.algorithmId,
      language: payload.language,
      basePath,
      filesPath,
      fileCount: payload.files.length,
    });

    try {
      const startTime = process.hrtime();

      // Create files and directories
      this.logger.debug('Creating execution files', {
        filesPath,
        files: payload.files.map((f) => ({
          name: f.name,
          size: f.content.length,
        })),
      });

      await this.fileService.createFiles(filesPath, payload);

      const [setupSeconds, setupNanoseconds] = process.hrtime(startTime);
      const setupTimeMs = (
        setupSeconds * 1000 +
        setupNanoseconds / 1e6
      ).toFixed(2);

      this.logger.debug('Files created successfully', {
        setupTimeMs,
        filesPath,
      });

      // Execute code
      this.logger.debug('Starting code execution', {
        language: payload.language,
        filesPath,
      });

      const executionStartTime = process.hrtime();
      const results = await executeCode(filesPath, payload.language);

      const [execSeconds, execNanoseconds] = process.hrtime(executionStartTime);
      const executionTimeMs = (
        execSeconds * 1000 +
        execNanoseconds / 1e6
      ).toFixed(2);

      const [totalSeconds, totalNanoseconds] = process.hrtime(startTime);
      const totalTimeMs = (
        totalSeconds * 1000 +
        totalNanoseconds / 1e6
      ).toFixed(2);

      this.logger.debug('Code execution metrics', {
        setupTimeMs,
        executionTimeMs,
        totalTimeMs,
        exitCode: results.exitCode,
        timedOut: results.timedOut,
        wallTime: results.wallTime,
        hasOutput: !!results.stdout,
        hasErrors: !!results.stderr,
        testResults: results.result
          ? {
              completed: results.result.completed,
              passed: results.result.passed,
              failed: results.result.failed,
              errors: results.result.errors,
            }
          : null,
      });

      return results;
    } catch (error) {
      this.logger.debug('Execution error details', {
        errorName: error.name,
        errorMessage: error.message,
        stackTrace: error.stack,
        filesPath,
      });

      this.logger.error('Execution failed', error.stack);

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
      this.logger.debug('Starting cleanup of execution environment', {
        filesPath,
      });

      await this.fileService.removeDirectory(filesPath);

      this.logger.debug('Cleanup completed', {
        filesPath,
      });
    }
  }
}
