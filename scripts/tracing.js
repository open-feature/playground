'use strict';

const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const {
  getNodeAutoInstrumentations,
} = require('@opentelemetry/auto-instrumentations-node');

registerInstrumentations({
  instrumentations: [getNodeAutoInstrumentations()],
});

const { Resource } = require('@opentelemetry/resources');
const {
  SemanticResourceAttributes,
} = require('@opentelemetry/semantic-conventions');
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { ZipkinExporter } = require('@opentelemetry/exporter-zipkin');
const { BatchSpanProcessor } = require('@opentelemetry/sdk-trace-base');

const provider = new NodeTracerProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'api-service',
  }),
});

provider.addSpanProcessor(
  new BatchSpanProcessor(
    new ZipkinExporter({
      url: 'http://localhost:9411/api/v2/spans',
    })
  )
);

provider.register();
