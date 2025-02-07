import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { otelSDK } from './tracing';
import { StructuredLogger } from './logger/structured-logger.service';

async function bootstrap() {
  try {
    const logger = new StructuredLogger();
    await otelSDK.start();
    const app = await NestFactory.create(AppModule, {
      logger,
    });
    logger.setContext('NestFactory');

    // Allow all CORS requests for now
    app.enableCors(); // TODO: Remove this in production and configure proper CORS

    await app.listen(process.env.APP_PORT || 3000);
    logger.log('Application started successfully');
  } catch (error) {
    const logger = new StructuredLogger();
    logger.setContext('Bootstrap');
    logger.error(
      'Failed to start application: ' +
        (error instanceof Error ? error.message : String(error)),
    );
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason) => {
  const logger = new StructuredLogger();
  logger.setContext('UnhandledRejection');
  logger.error('Unhandled Promise Rejection: ' + String(reason));
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  const logger = new StructuredLogger();
  logger.setContext('UncaughtException');
  logger.error(
    'Uncaught Exception: ' +
      (error instanceof Error ? error.message : String(error)),
  );
});

bootstrap();
