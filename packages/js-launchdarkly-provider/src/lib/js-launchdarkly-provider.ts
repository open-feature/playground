import {
  Context,
  ContextTransformer,
  FeatureProvider,
  FlagValue,
  ParseError,
  ProviderEvaluation,
  ProviderOptions,
  Reason,
  TypeMismatchError,
} from '@openfeature/openfeature-js';
import {
  init,
  LDClient,
  LDEvaluationReason,
  LDUser,
} from 'launchdarkly-node-server-sdk';

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

  isEnabledEvaluation(
    flagKey: string,
    defaultValue: boolean,
    user: LDUser
  ): Promise<ProviderEvaluation<boolean>> {
    return this.getBooleanEvaluation(flagKey, defaultValue, user);
  }

  async getBooleanEvaluation(
    flagKey: string,
    defaultValue: boolean,
    user: LDUser
  ): Promise<ProviderEvaluation<boolean>> {
    const details = await this.evaluateFlag<boolean>(
      flagKey,
      defaultValue,
      user
    );
    if (typeof details.value === 'boolean') {
      return details;
    } else {
      throw new TypeMismatchError(
        this.getFlagTypeErrorMessage(flagKey, details.value, 'boolean')
      );
    }
  }

  async getStringEvaluation(
    flagKey: string,
    defaultValue: string,
    user: LDUser
  ): Promise<ProviderEvaluation<string>> {
    const details = await this.evaluateFlag<string>(
      flagKey,
      defaultValue,
      user
    );
    if (typeof details.value === 'string') {
      return details;
    } else {
      throw new TypeMismatchError(
        this.getFlagTypeErrorMessage(flagKey, details.value, 'string')
      );
    }
  }

  async getNumberEvaluation(
    flagKey: string,
    defaultValue: number,
    user: LDUser
  ): Promise<ProviderEvaluation<number>> {
    const details = await this.evaluateFlag<number>(
      flagKey,
      defaultValue,
      user
    );
    if (typeof details.value === 'number') {
      return details;
    } else {
      throw new TypeMismatchError(
        this.getFlagTypeErrorMessage(flagKey, details.value, 'number')
      );
    }
  }

  async getObjectEvaluation<U extends object>(
    flagKey: string,
    defaultValue: U,
    user: LDUser
  ): Promise<ProviderEvaluation<U>> {
    const details = await this.evaluateFlag<unknown>(
      flagKey,
      JSON.stringify(defaultValue),
      user
    );
    if (typeof details.value === 'string') {
      // we may want to allow the parsing to be customized.
      try {
        return { ...details, value: JSON.parse(details.value) as U };
      } catch (err) {
        throw new ParseError(`Error parsing flag value for ${flagKey}`);
      }
    } else {
      throw new TypeMismatchError(
        this.getFlagTypeErrorMessage(flagKey, details, 'object')
      );
    }
  }

  private getFlagTypeErrorMessage(
    flagKey: string,
    value: unknown,
    expectedType: string
  ) {
    return `Flag value ${flagKey} had unexpected type ${typeof value}, expected ${expectedType}.`;
  }

  // LD values can be boolean, number, or string: https://docs.launchdarkly.com/sdk/client-side/node-js#getting-started
  private async evaluateFlag<T>(
    flagKey: string,
    defaultValue: FlagValue,
    user: LDUser
  ): Promise<ProviderEvaluation<T>> {
    // await the initialization before actually calling for a flag.
    await this.initialized;

    const details = await this.client.variationDetail(
      flagKey,
      user,
      defaultValue
    );
    return {
      value: details.value,
      variant: details.variationIndex?.toString(),
      reason: this.mapReason(details.reason),
    };
  }

  private mapReason(reason: LDEvaluationReason) {
    switch (reason.kind) {
      case 'OFF':
        return Reason.DISABLED;
      case 'FALLTHROUGH':
        return Reason.DEFAULT;
      case 'TARGET_MATCH':
        return Reason.TARGETING_MATCH;
      case 'RULE_MATCH':
        return Reason.TARGETING_MATCH;
      case 'PREREQUISITE_FAILED':
        return Reason.DEFAULT;
      case 'ERROR':
        return Reason.ERROR;
      default:
        return Reason.UNKNOWN;
    }
  }
}
