'use strict';

const { propagation } = require('@opentelemetry/api');
const { CompositePropagator, W3CBaggagePropagator, W3CTraceContextPropagator } = require('@opentelemetry/core');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');

/**
 * Load directly from the dist folder because `tracing.js` is used outside normal NX
 * operations. That means the `openfeature-propagator` is not automatically bundled
 * during the build process.
 */
const { OpenFeaturePropagator } = require('../dist/packages/openfeature-propagator/src/index');

registerInstrumentations({
  instrumentations: [getNodeAutoInstrumentations()],
});

const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
// const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-grpc');
const { BatchSpanProcessor } = require('@opentelemetry/sdk-trace-base');

propagation.setGlobalPropagator(
  new CompositePropagator({
    propagators: [new W3CBaggagePropagator(), new W3CTraceContextPropagator(), new OpenFeaturePropagator()],
  })
);

const serviceName = process.env['OTEL_SERVICE_NAME'] || 'fib3r';

const provider = new NodeTracerProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
  }),
});

console.log('starting new span processor');
provider.addSpanProcessor(
  new BatchSpanProcessor(
    new OTLPTraceExporter({
      url: 'http://otel-collector:4317',
    })
  )
);

provider.register();
