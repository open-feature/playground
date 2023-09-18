import { parseValidJsonObject } from '@openfeature/utils';
import {
  EvaluationContext,
  OpenFeatureEventEmitter,
  JsonValue,
  Logger,
  ParseError,
  Provider,
  ProviderEvents,
  ResolutionDetails,
  TypeMismatchError,
  ProviderStatus,
} from '@openfeature/web-sdk';
import flagsmith from 'flagsmith';

export interface FlagsmithProviderOptions {
  logger?: Logger;
  environmentID: string;
}

/*
 * NOTE: This is an unofficial provider that was created for demonstration
 * purposes only. The playground environment will be updated to use official
 * providers once they're available.
 *
 * Minimum provider for Flagsmith.
 *
 * NOTE: Flagsmith differentiates between flag activity and boolean flag values, so in this provider, `isEnabled`
 * is NOT a proxy to `getBooleanValue`.
 *
 * NOTE: Flagsmith defaults values to `null` and booleans to false. In this provider implementation, this will result in
 * a `FlagTypeError` for undefined flags, which in turn will result in the default passed to OpenFeature being used.
 */
export class FlagsmithProvider implements Provider {
  metadata = {
    name: 'flagsmith',
  };

  private _status = ProviderStatus.NOT_READY;

  get status() {
    return this._status;
  }

  events = new OpenFeatureEventEmitter();

  constructor(private readonly options: FlagsmithProviderOptions) {}

  initialize(context: EvaluationContext): Promise<void> {
    const initPromise = flagsmith
      .init({
        environmentID: this.options.environmentID,
        realtime: true,
        traits: context as any,
        identity: context.targetingKey || 'anon',
        onChange: (oldFlags, params) => {
          this.options.logger?.info(`Got change event: ${params}`);
          this.events.emit(ProviderEvents.ConfigurationChanged);
        },
      })
      .then(() => {
        this._status = ProviderStatus.READY;
      });
    // start polling API
    flagsmith.startListening();
    return initPromise;
  }

  async onContextChange(oldContext: EvaluationContext, newContext: EvaluationContext): Promise<void> {
    if (!newContext.targetingKey) {
      await flagsmith.logout();
    } else {
      await flagsmith.identify(newContext.targetingKey || 'anon', newContext as any);
    }
  }

  async onClose() {
    flagsmith.stopListening();
  }

  resolveBooleanEvaluation(flagKey: string, _: boolean, context: EvaluationContext): ResolutionDetails<boolean> {
    const details = this.evaluate(flagKey);
    if (typeof details.value === 'boolean') {
      const value = details.value;
      return { ...details, value };
    } else {
      throw new TypeMismatchError(this.getFlagTypeErrorMessage(flagKey, details.value, 'boolean'));
    }
  }

  resolveStringEvaluation(flagKey: string, _: string, context: EvaluationContext): ResolutionDetails<string> {
    const details = this.evaluate(flagKey);
    if (typeof details.value === 'string') {
      const value = details.value;
      return { ...details, value };
    } else {
      throw new TypeMismatchError(this.getFlagTypeErrorMessage(flagKey, details.value, 'string'));
    }
  }

  resolveNumberEvaluation(flagKey: string, _: number, context: EvaluationContext): ResolutionDetails<number> {
    const details = this.evaluate(flagKey);
    if (typeof details.value === 'number') {
      const value = details.value;
      return { ...details, value };
    } else {
      throw new TypeMismatchError(this.getFlagTypeErrorMessage(flagKey, details.value, 'number'));
    }
  }

  resolveObjectEvaluation<U extends JsonValue>(
    flagKey: string,
    _: U,
    context: EvaluationContext
  ): ResolutionDetails<U> {
    const details = this.evaluate(flagKey);
    if (typeof details.value === 'string') {
      // we may want to allow the parsing to be customized.
      try {
        return {
          value: parseValidJsonObject(details.value),
        };
      } catch (err) {
        throw new ParseError(`Error parsing flag value for ${flagKey}`);
      }
    } else {
      throw new TypeMismatchError(this.getFlagTypeErrorMessage(flagKey, details.value, 'object'));
    }
  }

  private evaluate<T>(flagKey: string): ResolutionDetails<T> {
    return { value: flagsmith.getValue(flagKey) };
  }

  private getFlagTypeErrorMessage(flagKey: string, value: unknown, expectedType: string) {
    return `Flag value ${flagKey} had unexpected type ${typeof value}, expected ${expectedType}.`;
  }
}