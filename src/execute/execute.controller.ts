import { Controller, Post, Body, ValidationPipe } from '@nestjs/common';

import { ExecuteCodeDTO, ExecuteCodeResponse } from './interfaces';
import { ExecuteService } from './execute.service';

@Controller('execute')
export class ExecuteController {
  constructor(private readonly executeService: ExecuteService) {}

  @Post()
  async runCode(
    @Body(new ValidationPipe()) payload: ExecuteCodeDTO,
  ): Promise<ExecuteCodeResponse> {
    const result = await this.executeService.execute(payload); // Call the execute method from the execute service
    return result;
  }
}
