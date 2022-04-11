import {
  Context,
  ContextTransformer,
  FeatureProvider,
  FlagEvaluationOptions,
  FlagTypeError,
  parseValidJsonObject,
  parseValidNumber,
  ProviderOptions
} from '@openfeature/openfeature-js';
import type { IClient, Attributes } from '@splitsoftware/splitio/types/splitio';
import { noopContextTransformer } from '@openfeature/openfeature-js';

export interface SplitProviderOptions extends ProviderOptions {
  splitClient: IClient;
}

/**
 * Transform the context into an object useful for the Split API, an key string with arbitrary Split "Attributes".
 */
 const DEFAULT_CONTEXT_TRANSFORMER = (context: Context): Consumer => {
  const { userId, ...attributes } = context;
  return {
    key: userId || 'anonymous',
    attributes
  };
};

type Consumer = {
  key: string;
  attributes: Attributes
};

export class OpenFeatureSplitProvider implements FeatureProvider<Consumer> {
  name = 'split';
  readonly contextTransformer: ContextTransformer<Consumer>;
  private initialized: Promise<void>;
  private client: IClient;
  
  constructor(options: SplitProviderOptions) {
    this.client = options.splitClient;
    // f contextTransformer to map context to split "Attributes".
    this.contextTransformer = DEFAULT_CONTEXT_TRANSFORMER || noopContextTransformer;
    // we don't expose any init events at the moment (we might later) so for now, lets create a private
    // promise to await into before we evaluate any flags.
    this.initialized = new Promise((resolve) => {
      this.client.on(this.client.Event.SDK_READY, () => {
        console.log(`Split Provider initialized`);
        resolve();
      });
    });
  }

  

  async isEnabled(
    flagId: string,
    defaultValue: boolean,
    keyWithAttributes: Consumer,
    options?: FlagEvaluationOptions
  ): Promise<boolean> {
    return this.getBooleanValue(flagId, defaultValue, keyWithAttributes, options);
  }

  /**
   * Split doesn't directly handle booleans as treatment values.
   * It will be up to the provider author and it's users to come up with conventions for converting strings to booleans.
   */
  async getBooleanValue(
    flagId: string,
    defaultValue: boolean,
    keyWithAttributes: Consumer,
    options?: FlagEvaluationOptions
  ): Promise<boolean> {
    await this.initialized;
    // simply casting Context to Attributes is likely a bad idea.
    const stringValue = this.client.getTreatment(
      keyWithAttributes.key,
      flagId,
      keyWithAttributes.attributes
    );
    const asUnknown = stringValue as unknown;

    switch (asUnknown) {
      case 'on':
        return true;
      case 'off':
        return false;
      case 'true':
        return true;
      case 'false':
        return false;
      case true:
        return true;
      case false:
        return false;
      default:
        throw new FlagTypeError(`Invalid boolean value for ${asUnknown}`);
    }
  }

  async getStringValue(
    flagId: string,
    defaultValue: string,
    keyWithAttributes: Consumer,
    options?: FlagEvaluationOptions
  ): Promise<string> {
    await this.initialized;
    return this.client.getTreatment(
      keyWithAttributes.key,
      flagId,
      keyWithAttributes.attributes
    );
  }

  async getNumberValue(
    flagId: string,
    defaultValue: number,
    keyWithAttributes: Consumer,
    options?: FlagEvaluationOptions
  ): Promise<number> {
    await this.initialized;
    const value = this.client.getTreatment(
      keyWithAttributes.key,
      flagId,
      keyWithAttributes.attributes
    );
    return parseValidNumber(value);
  }

  async getObjectValue<T extends object>(
    flagId: string,
    defaultValue: T,
    keyWithAttributes: Consumer,
    options?: FlagEvaluationOptions
  ): Promise<T> {
    await this.initialized;
    const value = this.client.getTreatment(
      keyWithAttributes.key,
      flagId,
      keyWithAttributes.attributes
    );
    return parseValidJsonObject(value);
  }
}
