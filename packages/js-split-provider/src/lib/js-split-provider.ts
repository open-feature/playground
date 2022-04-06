import {
  Context,
  ContextTransformer,
  FeatureProvider,
  parseValidJsonObject,
  parseValidNumber,
  ProviderEvaluation,
  ProviderOptions,
  Reason,
  TypeMismatchError,
} from '@openfeature/openfeature-js';
import type { Attributes, IClient } from '@splitsoftware/splitio/types/splitio';

/**
 * This simple provider implementation relies on storing all data as strings in the treatment value.
 *
 * It may be more idiomatic to only rely on that for the "isEnabled" calls,
 * and for all values store the data in teh associated "split config" JSON.
 */
export interface SplitProviderOptions extends ProviderOptions<Consumer> {
  splitClient: IClient;
}

/**
 * Transform the context into an object useful for the Split API, an key string with arbitrary Split "Attributes".
 */
const DEFAULT_CONTEXT_TRANSFORMER = (context: Context): Consumer => {
  const { userId, ...attributes } = context;
  return {
    key: userId || 'anonymous',
    attributes,
  };
};

type Consumer = {
  key: string;
  attributes: Attributes;
};

export class OpenFeatureSplitProvider implements FeatureProvider<Consumer> {
  name = 'split';
  readonly contextTransformer: ContextTransformer<Consumer>;
  private initialized: Promise<void>;
  private client: IClient;

  constructor(options: SplitProviderOptions) {
    this.client = options.splitClient;
    // contextTransformer to map context to split "Attributes".
    this.contextTransformer =
      options.contextTransformer || DEFAULT_CONTEXT_TRANSFORMER;
    // we don't expose any init events at the moment (we might later) so for now, lets create a private
    // promise to await into before we evaluate any flags.
    this.initialized = new Promise((resolve) => {
      this.client.on(this.client.Event.SDK_READY, () => {
        console.log(`${this.name} provider initialized`);
        resolve();
      });
    });
  }

  isEnabledEvaluation(
    flagKey: string,
    defaultValue: boolean,
    consumer: Consumer
  ): Promise<ProviderEvaluation<boolean>> {
    return this.getBooleanEvaluation(flagKey, defaultValue, consumer);
  }

  async getBooleanEvaluation(
    flagKey: string,
    _defaultValue: boolean,
    consumer: Consumer
  ): Promise<ProviderEvaluation<boolean>> {
    const details = await this.evaluateTreatment(flagKey, consumer);

    let value: boolean;
    switch (details.value as unknown) {
      case 'on':
        value = true;
        break;
      case 'off':
        value = false;
        break;
      case 'true':
        value = true;
        break;
      case 'false':
        value = false;
        break;
      case true:
        value = true;
        break;
      case false:
        value = false;
        break;
      default:
        throw new TypeMismatchError(
          `Invalid boolean value for ${details.value}`
        );
    }
    return { ...details, value };
  }

  async getStringEvaluation(
    flagKey: string,
    _defaultValue: string,
    consumer: Consumer
  ): Promise<ProviderEvaluation<string>> {
    return this.evaluateTreatment(flagKey, consumer);
  }

  async getNumberEvaluation(
    flagKey: string,
    _defaultValue: number,
    consumer: Consumer
  ): Promise<ProviderEvaluation<number>> {
    const details = await this.evaluateTreatment(flagKey, consumer);
    return { ...details, value: parseValidNumber(details.value) };
  }

  async getObjectEvaluation<U extends object>(
    flagKey: string,
    _defaultValue: U,
    consumer: Consumer
  ): Promise<ProviderEvaluation<U>> {
    const details = await this.evaluateTreatment(flagKey, consumer);
    return { ...details, value: parseValidJsonObject(details.value) };
  }

  private async evaluateTreatment(
    flagKey: string,
    consumer: Consumer
  ): Promise<ProviderEvaluation<string>> {
    await this.initialized;
    const value = this.client.getTreatment(
      consumer.key,
      flagKey,
      consumer.attributes
    );
    return {
      value,
      reason: Reason.UNKNOWN,
    };
  }
}
