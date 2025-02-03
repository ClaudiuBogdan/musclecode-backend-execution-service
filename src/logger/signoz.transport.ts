import * as Transport from 'winston-transport';
import * as https from 'https';
import axios, { AxiosInstance } from 'axios';
import { Logger } from '@opentelemetry/api-logs';
import {
  LOG_BATCH_SIZE,
  FLUSH_INTERVAL,
  EMPTY_TRACE_ID,
  EMPTY_SPAN_ID,
} from '../config/logger.config';

interface SignozTransportOptions extends Transport.TransportStreamOptions {
  host?: string;
  path?: string;
  ssl?: boolean;
  port?: number;
  auth?: string;
  otelLogger?: Logger;
}

// Interface for OTLP formatted log entry
interface OTLPLogEntry {
  resourceLogs: {
    resource: {
      attributes: {
        [key: string]: { stringValue: string };
      };
    };
    instrumentationLibraryLogs: {
      logs: {
        timeUnixNano: number;
        severityNumber: number;
        severityText: string;
        name: string;
        body: {
          stringValue: string;
        };
        attributes: {
          [key: string]: { stringValue: string };
        };
        droppedAttributesCount: number;
        flags: number;
        traceId: string;
        spanId: string;
        observedTimeUnixNano: number;
      }[];
    }[];
  }[];
}

export class SignozTransport extends Transport {
  private logBuffer: OTLPLogEntry[] = [];
  private flushTimeout: NodeJS.Timeout | null = null;
  private host: string;
  private path: string;
  private ssl: boolean;
  private port: number;
  private auth?: string;
  private otelLogger?: Logger;
  private axiosInstance: AxiosInstance;

  constructor(opts?: SignozTransportOptions) {
    super(opts);
    this.host = opts?.host;
    this.path = opts?.path;
    this.ssl = opts?.ssl !== false;
    this.port = opts?.port || 443;
    this.auth = opts?.auth;
    this.otelLogger = opts?.otelLogger;

    // Initialize axios instance with keep-alive and timeout
    this.axiosInstance = axios.create({
      httpsAgent: new https.Agent({ keepAlive: true }),
      timeout: 10000, // 10 second timeout
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'OTel-OTLP-Exporter-JavaScript/0.57.1',
        ...(this.auth ? { Authorization: this.auth } : {}),
      },
    });

    this.scheduleFlush();
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

    if (this.otelLogger) {
      // Use OpenTelemetry logger if available
      this.otelLogger.emit({
        severityNumber: this.getSeverityNumber(info.level),
        severityText: info.level.toUpperCase(),
        body: {
          ...info,
          attributes: undefined,
        },
        attributes: {
          ...info.attributes,
        },
        timestamp: Date.now(),
      });
      callback();
      return;
    }

    // Compute current time once for consistency
    const currentTime = Date.now();

    // Format attributes according to OTLP spec
    const attributes = Object.entries(info)
      .filter(
        ([key]) =>
          !['level', 'message', 'timestamp', 'traceId', 'spanId'].includes(key),
      )
      .reduce(
        (acc, [key, value]) => {
          if (value !== undefined) {
            acc[key] = { stringValue: String(value) };
          }
          return acc;
        },
        {} as Record<string, { stringValue: string }>,
      );

    const logEntry: OTLPLogEntry = {
      resourceLogs: [
        {
          resource: {
            attributes: {
              'service.name': { stringValue: 'execution-worker' },
              'service.environment': {
                stringValue: process.env.NODE_ENV || 'development',
              },
            },
          },
          instrumentationLibraryLogs: [
            {
              logs: [
                {
                  timeUnixNano: currentTime,
                  severityNumber: this.getSeverityNumber(info.level),
                  severityText: info.level.toUpperCase(),
                  name: 'winston',
                  body: {
                    stringValue: info.message,
                  },
                  attributes,
                  droppedAttributesCount: 0,
                  flags: 1,
                  traceId: info.traceId || EMPTY_TRACE_ID,
                  spanId: info.spanId || EMPTY_SPAN_ID,
                  observedTimeUnixNano: currentTime,
                },
              ],
            },
          ],
        },
      ],
    };

    this.logBuffer.push(logEntry);

    if (this.logBuffer.length >= LOG_BATCH_SIZE) {
      this.flush();
    }

    callback();
  }

  private scheduleFlush(): void {
    if (this.flushTimeout) {
      clearTimeout(this.flushTimeout);
    }
    this.flushTimeout = setTimeout(() => this.flush(), FLUSH_INTERVAL);
  }

  private async flush(): Promise<void> {
    if (this.logBuffer.length === 0) {
      this.scheduleFlush();
      return;
    }

    const logsToSend = [...this.logBuffer];
    this.logBuffer = [];

    // Combine all logs into a single OTLP payload
    const combinedLogs: OTLPLogEntry = {
      resourceLogs: [
        {
          resource: logsToSend[0].resourceLogs[0].resource,
          instrumentationLibraryLogs: [
            {
              logs: logsToSend.flatMap(
                (entry) =>
                  entry.resourceLogs[0].instrumentationLibraryLogs[0].logs,
              ),
            },
          ],
        },
      ],
    };

    try {
      await this.sendLogs(combinedLogs);
    } catch (error) {
      console.error('Failed to send logs to SigNoz:', error);
      // Re-add logs to the buffer for retry
      this.logBuffer = [...logsToSend, ...this.logBuffer];
    }

    this.scheduleFlush();
  }

  private async sendLogs(logs: OTLPLogEntry): Promise<void> {
    const url = `${this.ssl ? 'https' : 'http'}://${this.host}:${this.port}${
      this.path
    }`;

    try {
      await this.axiosInstance.post(url, logs);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `HTTP error! ${
            error.response
              ? `status: ${error.response.status}, response: ${JSON.stringify(
                  error.response.data,
                )}`
              : `message: ${error.message}`
          }`,
        );
      }
      throw error;
    }
  }

  close(): Promise<void> {
    if (this.flushTimeout) {
      clearTimeout(this.flushTimeout);
      this.flushTimeout = null;
    }
    return this.flush();
  }
}
