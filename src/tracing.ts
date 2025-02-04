import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { config } from './config/load-config';

const traceExporter = new OTLPTraceExporter({
  url: config.TRACE_ENDPOINT,
});

export const otelSDK = new NodeSDK({
  resource: new Resource({
    [ATTR_SERVICE_NAME]: 'execution-worker',
    environment: process.env.NODE_ENV || 'development',
  }),
  traceExporter,
  instrumentations: [getNodeAutoInstrumentations()],
});

// gracefully shut down the SDK on process exit
process.on('SIGTERM', () => {
  otelSDK
    .shutdown()
    .then(
      () => console.log('SDK shut down successfully'),
      (err) => console.log('Error shutting down SDK', err),
    )
    .finally(() => process.exit(0));
});
