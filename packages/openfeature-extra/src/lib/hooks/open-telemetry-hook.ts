import { Context, Hook } from '@openfeature/openfeature-js';
import { Span, trace, Tracer } from '@opentelemetry/api';
import { type } from 'os';

export const SpanProperties = {
  FEATURE_FLAG_CLIENT_NAME: 'feature_flag_client_name',
  FEATURE_FLAG_CLIENT_VERSION: 'feature_flag_client_version',
  FEATURE_FLAG_SERVICE: 'feature_flag_service',
  FEATURE_FLAG_ID: 'feature_flag_id',
  FEATURE_FLAG_VALUE: 'feature_flag_variation_string',
};

export class OpenTelemetryHook implements Hook<number> {

  private tracer: Tracer;

  constructor(private readonly name: string) {
    this.tracer = trace.getTracer(name);
  }

  before(context: Context, flagId: string) {
    
    const span = this.startSpan(`feature flag - ${type}`);
    span.setAttribute(SpanProperties.FEATURE_FLAG_ID, flagId);

    context['otel'] = {
      span
    };
    return context;
  }

  after(context: Context, flagId: string, flagValue: number) {
    ((context['otel'] as any).span as Span).setAttribute(SpanProperties.FEATURE_FLAG_VALUE, flagValue.toString());
    return flagValue;
  }

  always(context: Context, flagId: string, flagValue?: number): void {
    ((context['otel'] as any).span as Span).end();
  }

  error(context: Context, flagId: string, err: Error) {
    // TODO: set error on span.
    console.error(err);
    // throw err;
  }

  private startSpan(spanName: string): Span {
    return this.tracer.startSpan(spanName, {
      attributes: {
        [SpanProperties.FEATURE_FLAG_CLIENT_NAME]: this.name,
        // TODO: fix this.
        [SpanProperties.FEATURE_FLAG_CLIENT_VERSION]: '11' ?? 'unknown',
        [SpanProperties.FEATURE_FLAG_SERVICE]: this.name,
      },
    });
  }
}