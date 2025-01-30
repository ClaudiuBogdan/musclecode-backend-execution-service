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

@Controller('execute')
export class ExecuteController {
  constructor(private readonly executeService: ExecuteService) {}

  @UseGuards(AuthGuard)
  @Post()
  async runCode(
    @Body(new ValidationPipe()) payload: ExecuteCodeDTO,
    @User('id') userId: string,
  ): Promise<CodeExecutionResponse> {
    const result = await this.executeService.execute(payload, userId);
    return result;
  }
}
