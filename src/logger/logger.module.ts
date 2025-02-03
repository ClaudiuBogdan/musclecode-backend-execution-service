import { Global, Module } from '@nestjs/common';
import { StructuredLogger } from './structured-logger.service';

@Global() // Make the logger available globally
@Module({
  providers: [StructuredLogger],
  exports: [StructuredLogger],
})
export class LoggerModule {}
