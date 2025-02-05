import { config } from './config/load-config';
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
  SEMRESATTRS_DEPLOYMENT_ENVIRONMENT,
} from '@opentelemetry/semantic-conventions';
import { SignozTransport } from './logger/signoz.transport';

const { combine, timestamp, printf } = winston.format;

// Custom format function that converts logs into OpenTelemetry log format
const otelLogFormat = printf(({ level, message, timestamp, ...metadata }) => {
  const logEntry = {
    ts: timestamp, // Timestamp in ISO format
    severity: level.toUpperCase(), // Convert level to uppercase
    body: { message }, // Main log message placed in the body field
    trace_id: metadata.trace_id || undefined,
    span_id: metadata.span_id || undefined,
    trace_flags: metadata.trace_flags || undefined,
    attributes: { ...metadata },
  };

  Object.keys(logEntry).forEach(
    (key) => logEntry[key] === undefined && delete logEntry[key],
  );
  return JSON.stringify(logEntry);
});

// Environment variables configuration

if (!config.LOG_ENDPOINT) {
  console.warn('Warning: LOG_ENDPOINT environment variable is not set');
}

// Create a Resource to represent this service with Kubernetes metadata
const resource = new Resource({
  [ATTR_SERVICE_NAME]: config.APP_NAME || 'my-service',
  [ATTR_SERVICE_VERSION]: config.APP_VERSION || '0.1.0',
  [SEMRESATTRS_DEPLOYMENT_ENVIRONMENT]: config.NODE_ENV,
  // Kubernetes specific attributes
  'k8s.node.name': config.HOSTNAME,
  'k8s.cluster.name': config.K8S_CLUSTER_NAME,
  'k8s.deployment.name': config.K8S_DEPLOYMENT_NAME,
  'k8s.namespace.name': config.K8S_NAMESPACE,
  'k8s.pod.name': config.K8S_POD_NAME,
});

console.log('Logger resources', resource);

// Construct the OTLP URL using protocol, host, port, and path
const otlpUrl = config.LOG_ENDPOINT;

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
  level: config.LOG_LEVEL || 'debug',
  defaultMeta: { attributes: {} },
  transports: [
    new winston.transports.Console({
      format: combine(timestamp(), otelLogFormat),
    }),
    new SignozTransport({
      otelLogger,
    }),
  ],
});

export default logger;
