import { ConsoleLogger, Injectable, OnModuleDestroy } from '@nestjs/common';
import * as winston from 'winston';
import logger from '../logger';

interface LogEntry {
  extraInfo?: string | Record<string, any>;
}

@Injectable()
export class StructuredLogger extends ConsoleLogger implements OnModuleDestroy {
  private readonly logger: winston.Logger;

  constructor() {
    super();
    this.logger = logger;
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

  log(message: string, extraInfo?: string | Record<string, any>): void {
    this.logger.info(message, this.formatExtraInfo(extraInfo));
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
    this.logger.error(message, logEntry);
  }

  warn(message: string, extraInfo?: string | Record<string, any>): void {
    this.logger.warn(message, this.formatExtraInfo(extraInfo));
  }

  debug(message: string, extraInfo?: string | Record<string, any>): void {
    this.logger.debug(message, this.formatExtraInfo(extraInfo));
  }

  verbose(message: string, extraInfo?: string | Record<string, any>): void {
    this.logger.verbose(message, this.formatExtraInfo(extraInfo));
  }

  child(metadata: Record<string, any>): StructuredLogger {
    const childLogger = new StructuredLogger();
    childLogger.logger.defaultMeta = {
      ...this.logger.defaultMeta,
      ...metadata,
    };
    return childLogger;
  }
}
