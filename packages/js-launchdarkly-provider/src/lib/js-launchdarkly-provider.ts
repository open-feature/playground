import {
  Context,
  ContextTransformer,
  FeatureProvider,
  FlagEvaluationOptions,
  FlagTypeError,
  FlagValue,
  FlagValueParseError,
  ProviderOptions,
} from '@openfeature/openfeature-js';
import { init, LDClient, LDUser } from 'launchdarkly-node-server-sdk';

export interface LaunchDarklyProviderOptions extends ProviderOptions<LDUser> {
  sdkKey: string;
}

/**
 * Transform the context into an object compatible with the Launch Darkly API, an object with a user "key", and other attributes.
 */
const DEFAULT_CONTEXT_TRANSFORMER = (context: Context): LDUser => {
  const { userId, ...attributes } = context;
  return {
    key: userId || 'anonymous',
    anonymous: userId ? false : true,
    // later, a well-defined set of standard attributes in Openfeature should be mapped to the appropriate standard attributes LaunchDarkly.
    custom: attributes,
  };
};

/**
 * A primitive LaunchDarkly provider
 */
export class OpenFeatureLaunchDarklyProvider
  implements FeatureProvider<LDUser>
{
  name = 'LaunchDarkly';
  readonly contextTransformer: ContextTransformer<LDUser>;

  private client: LDClient;
  private initialized: Promise<void>;

  constructor(options: LaunchDarklyProviderOptions) {
    this.client = init(options.sdkKey);
    this.contextTransformer =
      options.contextTransformer || DEFAULT_CONTEXT_TRANSFORMER;

    // we don't expose any init events at the moment (we might later) so for now, lets create a private
    // promise to await into before we evaluate any flags.
    this.initialized = new Promise((resolve) => {
      this.client.once('ready', () => {
        console.log(`${this.name}: initialization complete.`);
        resolve();
      });
    });
  }

  isEnabled(
    flagId: string,
    defaultValue: boolean,
    user: LDUser,
    options?: FlagEvaluationOptions
  ): Promise<boolean> {
    return this.getBooleanValue(flagId, defaultValue, user);
  }

  async getBooleanValue(
    flagId: string,
    defaultValue: boolean,
    user: LDUser,
    options?: FlagEvaluationOptions
  ): Promise<boolean> {
    const value = await this.evaluateFlag(flagId, defaultValue, user);
    if (typeof value === 'boolean') {
      return value;
    } else {
      throw new FlagTypeError(
        this.getFlagTypeErrorMessage(flagId, value, 'boolean')
      );
    }
  }

  async getStringValue(
    flagId: string,
    defaultValue: string,
    user: LDUser,
    options?: FlagEvaluationOptions
  ): Promise<string> {
    const value = await this.evaluateFlag(flagId, defaultValue, user);
    if (typeof value === 'string') {
      return value;
    } else {
      throw new FlagTypeError(
        this.getFlagTypeErrorMessage(flagId, value, 'string')
      );
    }
  }

  async getNumberValue(
    flagId: string,
    defaultValue: number,
    user: LDUser,
    options?: FlagEvaluationOptions
  ): Promise<number> {
    const value = await this.evaluateFlag(flagId, defaultValue, user);
    if (typeof value === 'number') {
      return value;
    } else {
      throw new FlagTypeError(
        this.getFlagTypeErrorMessage(flagId, value, 'number')
      );
    }
  }

  /**
   * NOTE: objects are not supported in Launch Darkly, for demo purposes, we use the string API,
   * and stringify the default.
   * This may not be performant, and other, more elegant solutions should be considered.
   */
  async getObjectValue<T extends object>(
    flagId: string,
    defaultValue: T,
    user: LDUser
  ): Promise<T> {
    const value = await this.evaluateFlag(
      flagId,
      JSON.stringify(defaultValue),
      user
    );
    if (typeof value === 'string') {
      // we may want to allow the parsing to be customized.
      try {
        return JSON.parse(value);
      } catch (err) {
        throw new FlagValueParseError(`Error parsing flag value for ${flagId}`);
      }
    } else {
      throw new FlagTypeError(
        this.getFlagTypeErrorMessage(flagId, value, 'object')
      );
    }
  }

  private getFlagTypeErrorMessage(
    flagId: string,
    value: unknown,
    expectedType: string
  ) {
    return `Flag value ${flagId} had unexpected type ${typeof value}, expected ${expectedType}.`;
  }

  // LD values can be boolean, number, or string: https://docs.launchdarkly.com/sdk/client-side/node-js#getting-started
  private async evaluateFlag(
    flagId: string,
    defaultValue: FlagValue,
    user: LDUser
  ): Promise<boolean | number | string> {
    // await the initialization before actually calling for a flag.
    await this.initialized;

    const flagValue = await this.client.variation(flagId, user, defaultValue);

    console.log(`Flag '${flagId}' has a value of '${flagValue}'`);
    return flagValue;
  }
}
