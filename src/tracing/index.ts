import { NodeSDK } from '@opentelemetry/sdk-node';
import { W3CTraceContextPropagator } from '@opentelemetry/core';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
  SEMRESATTRS_DEPLOYMENT_ENVIRONMENT,
} from '@opentelemetry/semantic-conventions';
import { config } from '../config/load-config';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core';
import { IncomingMessage } from 'http';

const traceExporter = new OTLPTraceExporter({
  url: config.TRACE_ENDPOINT,
});

const propagator = new W3CTraceContextPropagator();

export const otelSDK = new NodeSDK({
  resource: new Resource({
    [ATTR_SERVICE_NAME]: config.APP_NAME,
    [ATTR_SERVICE_VERSION]: config.APP_VERSION,
    [SEMRESATTRS_DEPLOYMENT_ENVIRONMENT]: config.NODE_ENV,
    // Kubernetes specific attributes
    'k8s.node.name': config.HOSTNAME,
    'k8s.cluster.name': config.K8S_CLUSTER_NAME,
    'k8s.deployment.name': config.K8S_DEPLOYMENT_NAME,
    'k8s.namespace.name': config.K8S_NAMESPACE,
    'k8s.pod.name': config.K8S_POD_NAME,
  }),
  spanProcessors: [new BatchSpanProcessor(traceExporter)],
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-http': {
        ignoreIncomingRequestHook: (req) => {
          // Ensure req.url is defined
          if (!req.url) return false;
          // Remove any query parameters from the URL
          const urlPath = req.url.split('?')[0];
          // Filter out only the /healthz endpoint from being instrumented
          return urlPath === '/healthz';
        },
        // The requestHook lets you add custom attributes from the request
        requestHook: (span, request) => {
          if (request instanceof IncomingMessage) {
            const headers = request.headers;
            const userId = headers['x-user-id'];
            if (userId) {
              span.setAttribute('user.id', userId);
            }
          }
        },
      },
    }),
    new NestInstrumentation(),
  ],
  textMapPropagator: propagator,
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
