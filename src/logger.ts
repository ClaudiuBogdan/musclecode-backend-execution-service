import 'dotenv/config';
import * as winston from 'winston';
import {
  LoggerProvider,
  SimpleLogRecordProcessor,
} from '@opentelemetry/sdk-logs';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { Resource } from '@opentelemetry/resources';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';
import { SignozTransport } from './logger/signoz.transport';

const { combine, timestamp, json } = winston.format;

// Environment variables configuration
const SIGNOZ_HOST = process.env.SIGNOZ_HOST;
const SIGNOZ_PATH = process.env.SIGNOZ_PATH;

if (!SIGNOZ_HOST || !SIGNOZ_PATH) {
  console.warn(
    'Warning: SIGNOZ_HOST or SIGNOZ_PATH environment variables are not set',
  );
}

// Create a Resource to represent this service
const resource = new Resource({
  [ATTR_SERVICE_NAME]: process.env.npm_package_name || 'my-service',
  [ATTR_SERVICE_VERSION]: process.env.npm_package_version || '0.1.0',
  environment: process.env.NODE_ENV || 'development',
});

// Construct the OTLP URL using protocol, host, port, and path
const otlpUrl = `${SIGNOZ_HOST}/${SIGNOZ_PATH}`;

// Setup OTLP Log Exporter to send logs to Signoz with proper configuration
const otlpLogExporter = new OTLPLogExporter({
  url: otlpUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  concurrencyLimit: 10,
  timeoutMillis: 30000,
});

// Create the LoggerProvider for OpenTelemetry logs
const loggerProvider = new LoggerProvider({
  resource,
});

// Add the processor with the exporter to the provider
loggerProvider.addLogRecordProcessor(
  new SimpleLogRecordProcessor(otlpLogExporter),
);

// Get a logger instance from the provider
const otelLogger = loggerProvider.getLogger('winston-logger');

// Create and configure the Winston logger with both Console and Signoz transports
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(timestamp(), json()),
  // TODO: read from file and update on deployment
  defaultMeta: {
    service: resource.attributes[ATTR_SERVICE_NAME],
    environment: resource.attributes.environment,
    version: resource.attributes[ATTR_SERVICE_VERSION],
  },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
    new SignozTransport({
      host: SIGNOZ_HOST,
      path: SIGNOZ_PATH,
      level: process.env.LOG_LEVEL || 'info',
      otelLogger,
    }),
  ],
});

export default logger;
