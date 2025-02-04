import { Injectable } from '@nestjs/common';
import { config, AppConfig } from './load-config';

@Injectable()
export class ConfigService {
  private readonly config: AppConfig = config;

  get port(): number {
    return this.config.APP_PORT;
  }

  get traceEndpoint(): string | undefined {
    return this.config.TRACE_ENDPOINT;
  }

  get logEndpoint(): string | undefined {
    return this.config.LOG_ENDPOINT;
  }

  get logBatchSize(): number {
    return this.config.LOG_BATCH_SIZE;
  }

  get logFlushInterval(): number {
    return this.config.FLUSH_INTERVAL;
  }

  get logLevel(): string {
    return this.config.LOG_LEVEL;
  }

  get nodeEnv(): string {
    return this.config.NODE_ENV;
  }

  get serviceName(): string | undefined {
    return this.config.APP_NAME;
  }

  get serviceVersion(): string | undefined {
    return this.config.APP_VERSION;
  }
}
