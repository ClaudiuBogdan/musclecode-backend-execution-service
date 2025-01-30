import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './health/health.module';
import { HealthController } from './health/health.controller';
import { ExecuteModule } from './execute/execute.module';
import { FileService } from './execute/files/file.service';
import { ConfigModule } from '@nestjs/config';
import { AuthGuard } from './auth/guards/auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [AuthModule, HealthModule, ExecuteModule, ConfigModule.forRoot()],
  controllers: [AppController, HealthController],
  providers: [
    AppService,
    FileService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
