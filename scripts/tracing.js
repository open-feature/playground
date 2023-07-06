'use strict';

const { propagation, diag, DiagConsoleLogger, DiagLogLevel } = require('@opentelemetry/api');
// const { CompositePropagator, W3CBaggagePropagator, W3CTraceContextPropagator } = require('@opentelemetry/core');
// const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { PeriodicExportingMetricReader, AggregationTemporality } = require('@opentelemetry/sdk-metrics');
const { OTLPMetricExporter } =  require('@opentelemetry/exporter-metrics-otlp-grpc');
const { NodeSDK } = require('@opentelemetry/sdk-node');

/**
 * Load directly from the dist folder because `tracing.js` is used outside normal NX
 * operations. That means the `openfeature-propagator` is not automatically bunded
 * during the build process.
 */
// const { OpenFeaturePropagator } = require('../dist/packages/openfeature-propagator/src/index');

// registerInstrumentations({
//   instrumentations: [getNodeAutoInstrumentations()],
// });

const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
// const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
// const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-grpc');

// propagation.setGlobalPropagator(
//   new CompositePropagator({
//     propagators: [
//       new W3CBaggagePropagator(),
//       new W3CTraceContextPropagator(),
//       new OpenFeaturePropagator(),
//     ],
//   })
// );

const serviceName = process.env['OTEL_SERVICE_NAME'] || 'fib3r';

// const provider = new NodeTracerProvider({
//   resource: new Resource({
//     [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
//   }),
// });

// console.log('starting new span processor');
// provider.addSpanProcessor(
//   new BatchSpanProcessor(
//     new OTLPTraceExporter({
//       url: 'http://otel-collector:4317',
//     })
//   )
// );

// provider.addMetricReader(new PeriodicExportingMetricReader({
//   exporter: new OTLPMetricExporter({
//     url: 'http://otel-collector:4317',
//     temporalityPreference: AggregationTemporality.DELTA
//   }),
//   exportIntervalMillis: 6000,
// }));

// provider.register();

// For troubleshooting, set the log level to DiagLogLevel.DEBUG
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

console.log("starting node configuration")
const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
  }),
  traceExporter: new OTLPTraceExporter({
    url: 'http://otel-collector:4317',
  }),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({
      url: 'http://otel-collector:4317',
      temporalityPreference: AggregationTemporality.DELTA
    }),
    exportIntervalMillis: 6000,
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});

console.log('finished node configuration')

console.log('starting sdk')
sdk.start()
console.log('finished sdk')
