import { FlagValue, Hook, HookContext } from '@openfeature/openfeature-js';
import { Span, trace, Tracer } from '@opentelemetry/api';

export const SpanProperties = {
  FEATURE_FLAG_CLIENT_NAME: 'feature_flag_client_name',
  FEATURE_FLAG_CLIENT_VERSION: 'feature_flag_client_version',
  FEATURE_FLAG_SERVICE: 'feature_flag_service',
  FEATURE_FLAG_ID: 'feature_flag_id',
  FEATURE_FLAG_VALUE: 'feature_flag_value',
};

/**
 * A hook that adds standard OpenTelemetry data.
 */
export class OpenTelemetryHook implements Hook {
  private spanMap = new WeakMap<HookContext, Span>();
  private tracer: Tracer;

  constructor(name: string) {
    this.tracer = trace.getTracer(name);
  }
  name = 'open-telemetry';

  before(hookContext: HookContext) {
    const span = this.tracer.startSpan(
      `feature flag - ${hookContext.flagValueType}`
    );
    span.setAttributes({
      [SpanProperties.FEATURE_FLAG_ID]: hookContext.flagKey,
      [SpanProperties.FEATURE_FLAG_CLIENT_NAME]: hookContext.client.name,
      [SpanProperties.FEATURE_FLAG_CLIENT_VERSION]: hookContext.client.version,
      [SpanProperties.FEATURE_FLAG_SERVICE]: hookContext.provider.name,
    });

    this.spanMap.set(hookContext, span);
    return hookContext.context;
  }

  after(hookContext: HookContext, flagValue: FlagValue) {
    const primitiveFlagValue =
      typeof flagValue === 'object' ? JSON.stringify(flagValue) : flagValue;
    this.spanMap
      .get(hookContext)
      ?.setAttribute(SpanProperties.FEATURE_FLAG_VALUE, primitiveFlagValue);
  }

  finally(hookContext: HookContext) {
    this.spanMap.get(hookContext)?.end();
  }

  error(hookContext: HookContext, err: Error) {
    this.spanMap.get(hookContext)?.recordException(err);
  }
}
