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
    this.logger.log('Received code execution request');
    try {
      const result = await this.executeService.execute(payload, userId);

      const executionStats = JSON.stringify({
        exitCode: result.exitCode,
        timedOut: result.timedOut,
        wallTime: result.wallTime,
      });
      this.logger.log(`Code execution completed successfully`, {
        executionStats,
      });

      return result;
    } catch (error) {
      this.logger.error('Code execution failed', error.stack);
      throw error;
    }
  }
}
