'use strict';

const { NodeSDK } = require('@opentelemetry/sdk-node');
const { CompositePropagator, W3CBaggagePropagator, W3CTraceContextPropagator } = require('@opentelemetry/core');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-grpc');
const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-grpc');
const { PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics');

/**
 * Load directly from the dist folder because `tracing.js` is used outside normal NX
 * operations. That means the `openfeature-propagator` is not automatically bundled
 * during the build process.
 */
const { OpenFeaturePropagator } = require('../dist/packages/openfeature-propagator/src/index');

const serviceName = process.env['OTEL_SERVICE_NAME'] || 'fib3r';
const collectorUrl = process.env['OTEL_COLLECTOR_URL'] || 'http://otel-collector:4317';

const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
  }),
  instrumentations: [getNodeAutoInstrumentations()],
  textMapPropagator: new CompositePropagator({
    propagators: [new W3CBaggagePropagator(), new W3CTraceContextPropagator(), new OpenFeaturePropagator()],
  }),
  traceExporter: new OTLPTraceExporter({
    url: collectorUrl,
    collectorUrl,
  }),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({
      url: collectorUrl,
    }),
    exportIntervalMillis: 5000,
  }),
});

sdk.start();