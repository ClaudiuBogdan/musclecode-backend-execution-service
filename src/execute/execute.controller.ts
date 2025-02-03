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
  private logger: StructuredLogger;

  constructor(
    private readonly executeService: ExecuteService,
    logger: StructuredLogger,
  ) {
    this.logger = logger.child({ context: 'ExecuteController' });
  }

  @UseGuards(AuthGuard)
  @Post()
  async runCode(
    @Body(new ValidationPipe()) payload: ExecuteCodeDTO,
    @User('id') userId: string,
  ): Promise<CodeExecutionResponse> {
    const logger = this.logger.child({
      userId,
      algorithmId: payload.algorithmId,
      language: payload.language,
    });

    logger.log('Received code execution request');

    try {
      const result = await this.executeService.execute(payload, userId);

      const executionStats = JSON.stringify({
        exitCode: result.exitCode,
        timedOut: result.timedOut,
        wallTime: result.wallTime,
      });
      logger.log(`Code execution completed successfully`, {
        executionStats,
      });

      return result;
    } catch (error) {
      logger.error('Code execution failed', error.stack);
      throw error;
    }
  }
}
