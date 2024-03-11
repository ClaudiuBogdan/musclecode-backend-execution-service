import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './health/health.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [HealthModule],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}
