import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Allow all CORS requests for now
  app.enableCors(); // TODO: Remove this in production and configure proper CORS

  await app.listen(process.env.APP_PORT || 3000);
}
bootstrap();
