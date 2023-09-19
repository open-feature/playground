import {
  EvaluationContext,
  OpenFeatureEventEmitter,
  FlagValue,
  JsonValue,
  Logger,
  ParseError,
  Provider,
  ProviderEvents,
  ResolutionDetails,
  TypeMismatchError,
  ProviderStatus,
} from '@openfeature/web-sdk';
import { initialize, LDClient, LDContext } from 'launchdarkly-js-client-sdk';

export interface LaunchDarklyProviderOptions {
  clientSideId: string;
  logger: Logger;
}

/**
 * NOTE: This is an unofficial provider that was created for demonstration
 * purposes only. The playground environment will be updated to use official
 * providers once they're available.
 */
export class LaunchDarklyProvider implements Provider {
  metadata = {
    name: 'LaunchDarkly',
  };

  private _status = ProviderStatus.NOT_READY;

  get status() {
    return this._status;
  }

  events = new OpenFeatureEventEmitter();

  private client!: LDClient;

  constructor(private options: LaunchDarklyProviderOptions) {}

  initialize(context: EvaluationContext): Promise<void> {
    const transformContext = this.transformContext(context);
    this.client = initialize(this.options.clientSideId, transformContext);

    return new Promise((resolve) => {
      // we don't expose any init events at the moment (we might later) so for now, lets create a private
      // promise to await into before we evaluate any flags.
      this.client.on('ready', () => {
        this.options.logger.info(`${this.metadata.name} provider initialized`);
        this._status = ProviderStatus.READY;
        resolve();
      });
      this.client.on('change', () => {
        this.events.emit(ProviderEvents.ConfigurationChanged);
      });
    });
  }

  // On context change, we need to reset LD's persisted client-side context, which is used in all evaluations.
  // This is what their "identify" API does (only exists on client).
  async onContextChange(oldContext: EvaluationContext, newContext: EvaluationContext): Promise<void> {
    await this.client.identify(this.transformContext(newContext));
  }

  async onClose() {
    this.client.close();
  }

  resolveBooleanEvaluation(
    flagKey: string,
    defaultValue: boolean,
    context: EvaluationContext
  ): ResolutionDetails<boolean> {
    const details = this.evaluateFlag<boolean>(flagKey, defaultValue);
    if (typeof details.value === 'boolean') {
      return details;
    } else {
      throw new TypeMismatchError(this.getFlagTypeErrorMessage(flagKey, details.value, 'boolean'));
    }
  }

  resolveStringEvaluation(
    flagKey: string,
    defaultValue: string,
    context: EvaluationContext
  ): ResolutionDetails<string> {
    const details = this.evaluateFlag<string>(flagKey, defaultValue);
    if (typeof details.value === 'string') {
      return details;
    } else {
      throw new TypeMismatchError(this.getFlagTypeErrorMessage(flagKey, details.value, 'string'));
    }
  }

  resolveNumberEvaluation(
    flagKey: string,
    defaultValue: number,
    context: EvaluationContext
  ): ResolutionDetails<number> {
    const details = this.evaluateFlag<number>(flagKey, defaultValue);
    if (typeof details.value === 'number') {
      return details;
    } else {
      throw new TypeMismatchError(this.getFlagTypeErrorMessage(flagKey, details.value, 'number'));
    }
  }

  resolveObjectEvaluation<U extends JsonValue>(
    flagKey: string,
    defaultValue: U,
    context: EvaluationContext
  ): ResolutionDetails<U> {
    const details = this.evaluateFlag<unknown>(flagKey, JSON.stringify(defaultValue));
    if (typeof details.value === 'string') {
      // we may want to allow the parsing to be customized.
      try {
        return { ...details, value: JSON.parse(details.value) as U };
      } catch (err) {
        throw new ParseError(`Error parsing flag value for ${flagKey}`);
      }
    } else {
      throw new TypeMismatchError(this.getFlagTypeErrorMessage(flagKey, details, 'object'));
    }
  }

  // Transform the context into an object compatible with the Launch Darkly API, an object with a user "key", and other attributes.
  private transformContext(context: EvaluationContext): LDContext {
    const { targetingKey, ...attributes } = context;
    return {
      kind: 'user',
      key: targetingKey || 'anonymous',
      anonymous: targetingKey ? false : true,
      // we only use "email" for demo purposes.
      email: attributes['email'],
      custom: attributes,
    };
  }

  private getFlagTypeErrorMessage(flagKey: string, value: unknown, expectedType: string) {
    return `Flag value ${flagKey} had unexpected type ${typeof value}, expected ${expectedType}.`;
  }

  // LD values can be boolean, number, or string: https://docs.launchdarkly.com/sdk/client-side/node-js#getting-started
  private evaluateFlag<T>(flagKey: string, defaultValue: FlagValue): ResolutionDetails<T> {
    const details = this.client.variationDetail(flagKey, defaultValue);
    return {
      value: details.value,
      variant: details.variationIndex?.toString(),
      reason: details.reason?.kind,
    };
  }
}
