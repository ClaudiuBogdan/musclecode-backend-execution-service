import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './health/health.module';
import { HealthController } from './health/health.controller';
import { ExecuteModule } from './execute/execute.module';
import { FileService } from './execute/files/file.service';
import { ConfigModule } from '@nestjs/config';
import { AuthGuard } from './auth/guards/auth.guard';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { LoggerModule } from './logger/logger.module';
import { UserIdInterceptor } from './interceptors/user-id.interceptor';

@Module({
  imports: [
    LoggerModule,
    AuthModule,
    HealthModule,
    ExecuteModule,
    ConfigModule.forRoot(),
  ],
  controllers: [AppController, HealthController],
  providers: [
    AppService,
    FileService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: UserIdInterceptor,
    },
  ],
})
export class AppModule {}
