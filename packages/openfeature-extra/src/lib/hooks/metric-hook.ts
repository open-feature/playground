import type { EvaluationDetails, FlagValue, Hook, HookContext } from "@openfeature/js-sdk";
import { Counter, ValueType, metrics } from '@opentelemetry/api';

// feature_flag.flagd.impression

export class OpenTelemetryMetricHook implements Hook {
  // private readonly resource: Resource;
  private readonly impression: Counter;

  // TODO check on magic resources
  constructor() {
    console.log("metric hook is registered")
    const meter = metrics.getMeter('js.openfeature.dev');

    this.impression = meter.createCounter(
      'feature_flag.impression',
      {
        valueType: ValueType.INT,
      })
  }

  after(hookContext: Readonly<HookContext<FlagValue>>, evaluationDetails: EvaluationDetails<FlagValue>, hookHints?: Readonly<Record<string, unknown>> | undefined): void | Promise<void> {
    hookContext.logger.info('calling impression hook');
    console.log('in metrics hook');
    this.impression.add(1, {
      'key': hookContext.flagKey,
      'provider': hookContext.providerMetadata.name,
      'variant': evaluationDetails.variant ?? evaluationDetails.value?.toString(),
      'reason': evaluationDetails.reason ?? 'UNKNOWN'
    })
  }
}