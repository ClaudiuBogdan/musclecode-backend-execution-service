import { Controller, Get } from '@nestjs/common';

@Controller('healthz')
export class HealthController {
  @Get()
  checkHealth(): string {
    return 'OK';
  }
}
