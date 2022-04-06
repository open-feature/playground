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

export class OpenFeatureSplitProvider implements FeatureProvider {
  name = 'split';
  readonly contextTransformer: ContextTransformer;
  private initialized: Promise<void>;
  private client: IClient;
  
  constructor(options: SplitProviderOptions) {
    this.client = options.splitClient;
    this.contextTransformer = options.contextTransformer || noopContextTransformer;
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
    context: Context,
    options?: FlagEvaluationOptions
  ): Promise<boolean> {
    return this.getBooleanValue(flagId, defaultValue, context, options);
  }

  /**
   * Split doesn't directly handle booleans as treatment values.
   * It will be up to the provider author and it's users to come up with conventions for converting strings to booleans.
   */
  async getBooleanValue(
    flagId: string,
    defaultValue: boolean,
    context: Context,
    options?: FlagEvaluationOptions
  ): Promise<boolean> {
    await this.initialized;
    // simply casting Context to Attributes is likely a bad idea.
    const stringValue = this.client.getTreatment(
      context?.userId ?? 'anonymous',
      flagId,
      context as Attributes
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
    context: Context,
    options?: FlagEvaluationOptions
  ): Promise<string> {
    await this.initialized;
    return this.client.getTreatment(
      context?.userId ?? 'anonymous',
      flagId,
      context as Attributes
    );
  }

  async getNumberValue(
    flagId: string,
    defaultValue: number,
    context: Context,
    options?: FlagEvaluationOptions
  ): Promise<number> {
    await this.initialized;
    const value = this.client.getTreatment(
      context?.userId ?? 'anonymous',
      flagId,
      context as Attributes
    );
    return parseValidNumber(value);
  }

  async getObjectValue<T extends object>(
    flagId: string,
    defaultValue: T,
    context: Context,
    options?: FlagEvaluationOptions
  ): Promise<T> {
    await this.initialized;
    const value = this.client.getTreatment(
      context?.userId ?? 'anonymous',
      flagId,
      context as Attributes
    );
    return parseValidJsonObject(value);
  }
}
