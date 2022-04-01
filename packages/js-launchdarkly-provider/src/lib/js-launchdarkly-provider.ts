import {
  Context,
  FeatureProvider,
  FlagEvaluationOptions,
  FlagTypeError,
  FlagValue,
  FlagValueParseError
} from '@openfeature/openfeature-js';
import { init, LDClient } from 'launchdarkly-node-server-sdk';

/**
 * A comically primitive LaunchDarkly provider demo
 */
export class OpenFeatureLaunchDarklyProvider implements FeatureProvider {
  name = 'LaunchDarkly';
  private client: LDClient;
  private initialized: Promise<void>;

  constructor(sdkKey: string) {

    this.client = init(sdkKey);

    // we don't expose any init events at the moment (we might later) so for now, lets create a private
    // promise to await into before we evaluate any flags.
    this.initialized = new Promise((resolve) => {
      this.client.once('ready', () => {
        console.log(`${this.name}: initialization complete.`);
        resolve();
      });
    });
    
  }
  
  isEnabled(flagId: string, defaultValue: boolean, context: Context, options?: FlagEvaluationOptions): Promise<boolean> {
    return this.getBooleanValue(flagId, defaultValue, context);
  }

  async getBooleanValue(flagId: string, defaultValue: boolean, context: Context, options?: FlagEvaluationOptions): Promise<boolean> {
    const value = await this.evaluateFlag(flagId, defaultValue, context);
    if (typeof value === 'boolean') {
      return value;
    } else {
      throw new FlagTypeError(this.getFlagTypeErrorMessage(flagId, value, 'boolean'));
    }
  }

  async getStringValue(flagId: string, defaultValue: string, context: Context, options?: FlagEvaluationOptions): Promise<string> {
    const value = await this.evaluateFlag(flagId, defaultValue, context);
    if (typeof value === 'string') {
      return value;
    } else {
      throw new FlagTypeError(this.getFlagTypeErrorMessage(flagId, value, 'string'));
    }
  }

  async getNumberValue(flagId: string, defaultValue: number, context: Context, options?: FlagEvaluationOptions): Promise<number> {
    const value = await this.evaluateFlag(flagId, defaultValue, context);
    if (typeof value === 'number') {
      return value;
    } else {
      throw new FlagTypeError(this.getFlagTypeErrorMessage(flagId, value, 'number'));
    }
  }

  /**
   * NOTE: objects are not supported in Launch Darkly, for demo purposes, we use the string API,
   * and stringify the default.
   * This may not be performant, and other, more elegant solutions should be considered.
   */
  async getObjectValue<T extends object>(flagId: string, defaultValue: T, context: Context): Promise<T> {
    const value = await this.evaluateFlag(flagId, JSON.stringify(defaultValue), context);
    if (typeof value === 'string') {
      // we may want to allow the parsing to be customized.
      try {
        return JSON.parse(value);
      } catch (err) {
        throw new FlagValueParseError(`Error parsing flag value for ${flagId}`);
      }
    } else {
      throw new FlagTypeError(this.getFlagTypeErrorMessage(flagId, value, 'object'));
    }
  }

  private getFlagTypeErrorMessage(flagId: string, value: unknown, expectedType: string) {
     return `Flag value ${flagId} had unexpected type ${typeof value}, expected ${expectedType}.`;
  }

  // LD values can be boolean, number, or string: https://docs.launchdarkly.com/sdk/client-side/node-js#getting-started
  private async evaluateFlag(flagId: string, defaultValue: FlagValue, context: Context): Promise<boolean | number | string> {
    // await the initialization before actually calling for a flag.
    await this.initialized;

    // eventually we'll want a well-defined SDK context object, whose properties will be mapped appropriately to each provider. 
    const userKey = context?.userId  ?? 'anonymous';
    const flagValue = await this.client.variation(flagId, { key: userKey, ...context }, defaultValue);

    console.log(`Flag '${flagId}' has a value of '${flagValue}'`);
    return flagValue;
  }
}
