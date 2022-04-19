import {
  FlagEvaluationDetails,
  FlagValue,
  Hook,
  HookContext,
} from '@openfeature/openfeature-js';
import { Span, trace, Tracer } from '@opentelemetry/api';

export const SpanProperties = {
  FLAG_KEY: 'feature_flag.flag_key',
  CLIENT_NAME: 'feature_flag.client.name',
  CLIENT_VERSION: 'feature_flag.client.version',
  PROVIDER_NAME: 'feature_flag.provider.name',
  PROVIDER_MANAGEMENT_URL: 'feature_flag.provider.management_url',
  VARIANT: 'feature_flag.evaluated.variant',
  VALUE: 'feature_flag.evaluated.value',
};

/**
 * A hook that adds standard OpenTelemetry data.
 */
export class OpenTelemetryHook implements Hook {
  name = 'open-telemetry';

  private spanMap = new WeakMap<HookContext, Span>();
  private tracer: Tracer;

  constructor(name: string) {
    this.tracer = trace.getTracer(name);
  }

  before(hookContext: HookContext) {
    const span = this.tracer.startSpan(
      `feature flag - ${hookContext.flagValueType}`
    );
    span.setAttributes({
      [SpanProperties.FLAG_KEY]: hookContext.flagKey,
      [SpanProperties.CLIENT_NAME]: hookContext.client.name,
      [SpanProperties.CLIENT_VERSION]: hookContext.client.version,
      [SpanProperties.PROVIDER_NAME]: hookContext.provider.name,
    });

    this.spanMap.set(hookContext, span);
    return hookContext.context;
  }

  after(hookContext: HookContext, flagValue: FlagEvaluationDetails<FlagValue>) {
    if (flagValue.variant) {
      this.spanMap
        .get(hookContext)
        ?.setAttribute(SpanProperties.VARIANT, flagValue.variant);
    } else {
      this.spanMap
        .get(hookContext)
        ?.setAttribute(SpanProperties.VALUE, JSON.stringify(flagValue.value));
    }
  }

  finally(hookContext: HookContext) {
    this.spanMap.get(hookContext)?.end();
  }

  error(hookContext: HookContext, err: Error) {
    this.spanMap.get(hookContext)?.recordException(err);
  }
}
