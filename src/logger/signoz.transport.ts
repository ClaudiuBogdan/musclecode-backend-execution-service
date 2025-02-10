import * as Transport from 'winston-transport';
import { Logger } from '@opentelemetry/api-logs';

interface SignozTransportOptions extends Transport.TransportStreamOptions {
  otelLogger: Logger;
}

export class SignozTransport extends Transport {
  private otelLogger: Logger;

  constructor(opts: SignozTransportOptions) {
    super(opts);
    this.otelLogger = opts.otelLogger;
  }

  private getSeverityNumber(level: string): number {
    const severityMap: Record<string, number> = {
      trace: 1,
      debug: 5,
      info: 9,
      warn: 13,
      error: 17,
      fatal: 21,
    };
    return severityMap[level.toLowerCase()] || 9;
  }

  log(info: any, callback: () => void): void {
    setImmediate(() => this.emit('logged', info));

    // Use OpenTelemetry logger if available
    const body = {
      ...info,
    };
    delete body.attributes;

    const attributes = {
      message: info.message,
      ...info.attributes,
    };

    this.otelLogger.emit({
      severityNumber: this.getSeverityNumber(info.level),
      severityText: info.level.toUpperCase(),
      body,
      attributes,
      timestamp: Date.now(),
    });
    callback();
  }
}
