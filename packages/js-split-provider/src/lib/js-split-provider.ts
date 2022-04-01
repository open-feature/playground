import {
  FeatureProvider, FlagEvaluationOptions, FlagTypeError,
  parseValidJsonObject,
  parseValidNumber
} from '@openfeature/openfeature-js';
import type { IClient } from '@splitsoftware/splitio/types/splitio';

export class OpenFeatureSplitProvider implements FeatureProvider {
  name = 'split';
  private initialized: Promise<void>;

  constructor(private readonly client: IClient) {
    // we don't expose any init events at the moment (we might later) so for now, lets create a private
    // promise to await into before we evaluate any flags.
    this.initialized = new Promise((resolve) => {
      client.on(client.Event.SDK_READY, () => {
        console.log(`Split Provider initialized`);
        resolve();
      });
    });
  }
  
  async isEnabled(flagId: string, defaultValue: boolean, options?: FlagEvaluationOptions): Promise<boolean> {
    return this.getBooleanValue(flagId, defaultValue, options);
  }

  /**
   * Split doesn't directly handle booleans as treatment values.
   * It will be up to the provider author and it's users to come up with conventions for converting strings to booleans.
   */
  async getBooleanValue(flagId: string, defaultValue: boolean, options?: FlagEvaluationOptions): Promise<boolean> {
    await this.initialized;
    const stringValue = this.client.getTreatment(options?.context?.userId ?? 'anonymous', flagId);
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
        throw new FlagTypeError(`Invalid boolean value for ${asUnknown}`)
    }
  }

  async getStringValue(flagId: string, defaultValue: string, options?: FlagEvaluationOptions): Promise<string> {
    await this.initialized;
    return this.client.getTreatment(options?.context?.userId ?? 'anonymous', flagId);
  }

  async getNumberValue(flagId: string, defaultValue: number, options?: FlagEvaluationOptions): Promise<number> {
    await this.initialized;
    const value = this.client.getTreatment(options?.context?.userId ?? 'anonymous', flagId);
    return parseValidNumber(value);
  }

  async getObjectValue<T extends object>(flagId: string, defaultValue: T, options?: FlagEvaluationOptions): Promise<T> {
    await this.initialized;
    const value = this.client.getTreatment(options?.context?.userId ?? 'anonymous', flagId);
    return parseValidJsonObject(value);
  }
}
