import { ConsoleLogger, Injectable, OnModuleDestroy } from '@nestjs/common';
import * as winston from 'winston';
import logger from '../logger';
import { asyncLocalStorage } from 'src/interceptors/request-context';

interface LogEntry {
  extraInfo?: string | Record<string, any>;
}

@Injectable()
export class StructuredLogger extends ConsoleLogger implements OnModuleDestroy {
  private readonly logger: winston.Logger;

  constructor(context?: string) {
    super();
    this.logger = logger;
    this.context = context;
  }

  async onModuleDestroy() {
    await new Promise<void>((resolve) => {
      this.logger.on('finish', resolve);
      this.logger.end();
    });
  }

  private formatExtraInfo(extraInfo?: string | Record<string, any>): LogEntry {
    const logEntry: LogEntry = {};

    if (extraInfo) {
      logEntry.extraInfo = extraInfo;
    }

    return logEntry;
  }

  debug(message: string, extraInfo?: string | Record<string, any>): void {
    this.addDefaultMetadata();
    this.logger.debug(message, this.formatExtraInfo(extraInfo));
  }

  log(message: string, extraInfo?: string | Record<string, any>): void {
    this.addDefaultMetadata();
    this.logger.info(message, this.formatExtraInfo(extraInfo));
  }

  warn(message: string, extraInfo?: string | Record<string, any>): void {
    this.addDefaultMetadata();
    this.logger.warn(message, this.formatExtraInfo(extraInfo));
  }

  error(
    message: string,
    traceDetails?: string,
    extraInfo?: string | Record<string, any>,
  ): void {
    const logEntry = this.formatExtraInfo({
      stack: traceDetails,
      extraInfo: extraInfo,
    });
    this.addDefaultMetadata();
    this.logger.error(message, logEntry);
  }

  private getUserId(): string | undefined {
    return asyncLocalStorage.getStore()?.userId;
  }

  private addDefaultMetadata() {
    const userId = this.getUserId();
    if (!this.logger.defaultMeta) {
      this.logger.defaultMeta = {
        attributes: {
          context: '',
        },
      };
    }
    if (userId) {
      this.logger.defaultMeta.attributes['user.id'] = userId;
    }
    if (this.context) {
      const defaultMetadata = this.logger.defaultMeta || {};
      defaultMetadata.attributes = defaultMetadata.attributes || {};
      defaultMetadata.attributes.context = this.context;
      this.logger.defaultMeta = defaultMetadata;
    }
  }
}
