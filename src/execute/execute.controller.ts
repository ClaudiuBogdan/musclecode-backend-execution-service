import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { CodeExecutionResponse, ExecuteCodeDTO } from './interfaces';
import { ExecuteService } from './execute.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { User } from 'src/auth/decorators/user.decorator';
import { StructuredLogger } from 'src/logger/structured-logger.service';

@Controller('execute')
export class ExecuteController {
  private readonly logger = new StructuredLogger('ExecuteController');
  constructor(private readonly executeService: ExecuteService) {}

  @UseGuards(AuthGuard)
  @Post()
  async runCode(
    @Body(new ValidationPipe()) payload: ExecuteCodeDTO,
    @User('id') userId: string,
  ): Promise<CodeExecutionResponse> {
    this.logger.debug('Processing code execution request', {
      userId,
      language: payload.language,
      algorithmId: payload.algorithmId,
      fileCount: payload.files?.length,
    });

    try {
      this.logger.debug('Validating request payload', {
        files: payload.files?.map((f) => ({
          name: f.name,
          size: f.content.length,
        })),
      });

      const result = await this.executeService.execute(payload, userId);

      const executionStats = {
        exitCode: result.exitCode,
        timedOut: result.timedOut,
        wallTime: result.wallTime,
        testsPassed: result.result?.passed,
        testsFailed: result.result?.failed,
        testsErrors: result.result?.errors,
        completed: result.result?.completed,
      };

      this.logger.debug('Code execution completed', {
        userId,
        algorithmId: payload.algorithmId,
        executionStats,
        hasOutput: !!result.stdout,
        hasErrors: !!result.stderr,
      });

      this.logger.log(`Code execution completed successfully`, {
        executionStats,
      });

      return result;
    } catch (error) {
      this.logger.debug('Code execution failed with error', {
        userId,
        algorithmId: payload.algorithmId,
        errorName: error.name,
        errorMessage: error.message,
        stackTrace: error.stack,
      });

      this.logger.error('Code execution failed', error.stack);
      throw error;
    }
  }
}
