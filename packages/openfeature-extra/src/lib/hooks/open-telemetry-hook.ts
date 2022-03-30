import {
  Context,
  FlagType,
  Hook,
  HookContext,
} from '@openfeature/openfeature-js';
import { Span, trace, Tracer } from '@opentelemetry/api';

export const SpanProperties = {
  FEATURE_FLAG_CLIENT_NAME: 'feature_flag_client_name',
  FEATURE_FLAG_CLIENT_VERSION: 'feature_flag_client_version',
  FEATURE_FLAG_SERVICE: 'feature_flag_service',
  FEATURE_FLAG_ID: 'feature_flag_id',
  FEATURE_FLAG_VALUE: 'feature_flag_variation_string',
};

export class OpenTelemetryHook implements Hook {
  private tracer: Tracer;
  /**
   * NOTE: This only works if the object reference remains the same throughout
   * the request.
   */
  private spans = new WeakMap<object, Span>();

  constructor(private readonly name: string) {
    this.tracer = trace.getTracer(name);
  }

  before(hookContext: HookContext) {
    const span = this.tracer.startSpan(
      `feature flag - ${hookContext.flagType}`
    );
    span.setAttributes({
      [SpanProperties.FEATURE_FLAG_ID]: hookContext.flagId,
      [SpanProperties.FEATURE_FLAG_CLIENT_NAME]: hookContext.client.name,
      [SpanProperties.FEATURE_FLAG_CLIENT_VERSION]: hookContext.client.version,
      [SpanProperties.FEATURE_FLAG_SERVICE]: hookContext.provider.name,
    });

    this.spans.set(hookContext.context, span);
  }

  finally(hookContext: HookContext, flagValue: unknown) {
    const span = this.spans.get(hookContext.context);
    span?.end();

    return flagValue;
  }

  error(hookContext: HookContext, err: Error) {
    const span = this.spans.get(hookContext.context);
    span?.recordException(err);
  }
}
