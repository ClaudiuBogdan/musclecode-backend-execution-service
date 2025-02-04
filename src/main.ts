import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { otelSDK } from './tracing';
import { StructuredLogger } from './logger/structured-logger.service';

async function bootstrap() {
  // Initialize OpenTelemetry
  await otelSDK.start();

  const logger = new StructuredLogger();
  const app = await NestFactory.create(AppModule, {
    logger,
  });
  logger.setContext('NestFactory');

  // Allow all CORS requests for now
  app.enableCors(); // TODO: Remove this in production and configure proper CORS

  await app.listen(process.env.APP_PORT || 3000);
}
bootstrap();
