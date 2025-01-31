import { Controller, Get } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';

@Controller('healthz')
export class HealthController {
  @Public()
  @Get()
  checkHealth(): string {
    return 'OK';
  }
}
