import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './health/health.module';
import { HealthController } from './health/health.controller';
import { ExecuteModule } from './execute/execute.module';
import { FileService } from './execute/files/file.service';

@Module({
  imports: [HealthModule, ExecuteModule],
  controllers: [AppController, HealthController],
  providers: [AppService, FileService],
})
export class AppModule {}
