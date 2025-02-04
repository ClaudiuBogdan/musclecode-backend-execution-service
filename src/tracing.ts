import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
  SEMRESATTRS_DEPLOYMENT_ENVIRONMENT,
} from '@opentelemetry/semantic-conventions';
import { config } from './config/load-config';

const traceExporter = new OTLPTraceExporter({
  url: config.TRACE_ENDPOINT,
});

export const otelSDK = new NodeSDK({
  resource: new Resource({
    [ATTR_SERVICE_NAME]: config.APP_NAME || 'my-service',
    [ATTR_SERVICE_VERSION]: config.APP_VERSION || '0.1.0',
    [SEMRESATTRS_DEPLOYMENT_ENVIRONMENT]: config.NODE_ENV,
    // Kubernetes specific attributes
    'k8s.node.name': config.HOSTNAME,
    'k8s.cluster.name': config.K8S_CLUSTER_NAME,
    'k8s.deployment.name': config.K8S_DEPLOYMENT_NAME,
    'k8s.namespace.name': config.K8S_NAMESPACE,
    'k8s.pod.name': config.K8S_POD_NAME,
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
