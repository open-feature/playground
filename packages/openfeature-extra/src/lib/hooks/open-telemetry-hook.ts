import { Hook, HookContext } from '@openfeature/openfeature-js';
import { Span, trace, Tracer } from '@opentelemetry/api';

export const SpanProperties = {
  FEATURE_FLAG_CLIENT_NAME: 'feature_flag_client_name',
  FEATURE_FLAG_CLIENT_VERSION: 'feature_flag_client_version',
  FEATURE_FLAG_SERVICE: 'feature_flag_service',
  FEATURE_FLAG_ID: 'feature_flag_id',
  FEATURE_FLAG_VALUE: 'feature_flag_variation_string',
};

type OTelHookContext = {
  context: {
    _span?: Span;
  };
} & HookContext;

export class OpenTelemetryHook implements Hook {
  private tracer: Tracer;

  constructor(private readonly name: string) {
    this.tracer = trace.getTracer(name);
  }

  before(hookContext: OTelHookContext) {
    const span = this.tracer.startSpan(
      `feature flag - ${hookContext.flagType}`
    );
    span.setAttributes({
      [SpanProperties.FEATURE_FLAG_ID]: hookContext.flagId,
      [SpanProperties.FEATURE_FLAG_CLIENT_NAME]: hookContext.client.name,
      [SpanProperties.FEATURE_FLAG_CLIENT_VERSION]: hookContext.client.version,
      [SpanProperties.FEATURE_FLAG_SERVICE]: hookContext.provider.name,
    });

    hookContext.context._span = span;
    return hookContext.context;
  }

  finally(hookContext: OTelHookContext, flagValue: unknown) {
    hookContext.context._span?.end();
    return flagValue;
  }

  error(hookContext: OTelHookContext, err: Error) {
    hookContext.context._span?.recordException(err);
  }
}
