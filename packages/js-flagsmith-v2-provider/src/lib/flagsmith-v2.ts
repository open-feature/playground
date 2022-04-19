import {
  Context,
  ContextTransformer,
  FeatureProvider,
  ParseError,
  parseValidJsonObject,
  ProviderEvaluation,
  ProviderOptions,
  Reason,
  TypeMismatchError,
} from '@openfeature/openfeature-js';
import Flagsmith from 'flagsmithv2/build/sdk';

type Identity = {
  identifier?: string;
  traits?: { [key: string]: boolean | number | string };
};

export interface FlagsmithV2ProviderOptions extends ProviderOptions<Identity> {
  client: Flagsmith;
}

/**
 * Transform the context into an object useful for the v2 Flagsmith API, an identifier string with a "dictionary" of traits.
 */
const DEFAULT_CONTEXT_TRANSFORMER = (context: Context): Identity => {
  const { userId, ...traits } = context;
  return {
    identifier: userId,
    traits,
  };
};

/*
 * Minimum provider for Flagsmith.
 *
 * NOTE: Flagsmith differentiates between flag activity and boolean flag values, so in this provider, `isEnabled`
 * is NOT a proxy to `getBooleanValue`.
 *
 * NOTE: Flagsmith defaults values to `null` and booleans to false. In this provider implementation, this will result in
 * a `FlagTypeError` for undefined flags, which in turn will result in the default passed to OpenFeature being used.
 */
export class FlagsmithV2Provider implements FeatureProvider<Identity> {
  name = 'flagsmith-v2';
  readonly contextTransformer: ContextTransformer<Identity>;
  private client: Flagsmith;

  constructor(options: FlagsmithV2ProviderOptions) {
    this.client = options.client;
    this.contextTransformer =
      options.contextTransformer || DEFAULT_CONTEXT_TRANSFORMER;
    console.log(`${this.name} provider initialized`);
  }

  /*
   * Flagsmith differentiates between flag activity and boolean flag values, so in this provider,`isEnabled` is NOT a proxy to `getBooleanValue`.
   */
  async isEnabledEvaluation(
    flagKey: string,
    _defaultValue: boolean,
    identity: Identity
  ): Promise<ProviderEvaluation<boolean>> {
    const value = identity.identifier
      ? (
          await this.client.getIdentityFlags(
            identity.identifier,
            identity.traits
          )
        ).isFeatureEnabled(flagKey)
      : (await this.client.getEnvironmentFlags()).isFeatureEnabled(flagKey);
    return {
      value,
      reason: Reason.UNKNOWN,
    };
  }

  async getBooleanEvaluation(
    flagKey: string,
    _defaultValue: boolean,
    identity: Identity
  ): Promise<ProviderEvaluation<boolean>> {
    const details = await this.evaluate(flagKey, identity);
    if (typeof details.value === 'boolean') {
      const value = details.value;
      return { ...details, value };
    } else {
      throw new TypeMismatchError(
        this.getFlagTypeErrorMessage(flagKey, details.value, 'boolean')
      );
    }
  }

  async getStringEvaluation(
    flagKey: string,
    _defaultValue: string,
    identity: Identity
  ): Promise<ProviderEvaluation<string>> {
    const details = await this.evaluate(flagKey, identity);
    if (typeof details.value === 'string') {
      const value = details.value;
      return { ...details, value };
    } else {
      throw new TypeMismatchError(
        this.getFlagTypeErrorMessage(flagKey, details.value, 'string')
      );
    }
  }

  async getNumberEvaluation(
    flagKey: string,
    _defaultValue: number,
    identity: Identity
  ): Promise<ProviderEvaluation<number>> {
    const details = await this.evaluate(flagKey, identity);
    if (typeof details.value === 'number') {
      const value = details.value;
      return { ...details, value };
    } else {
      throw new TypeMismatchError(
        this.getFlagTypeErrorMessage(flagKey, details.value, 'number')
      );
    }
  }

  async getObjectEvaluation<U extends object>(
    flagKey: string,
    _defaultValue: U,
    identity: Identity
  ): Promise<ProviderEvaluation<U>> {
    const details = await this.evaluate(flagKey, identity);
    if (typeof details.value === 'string') {
      // we may want to allow the parsing to be customized.
      try {
        return {
          value: parseValidJsonObject(details.value),
          reason: Reason.DEFAULT,
        };
      } catch (err) {
        throw new ParseError(`Error parsing flag value for ${flagKey}`);
      }
    } else {
      throw new TypeMismatchError(
        this.getFlagTypeErrorMessage(flagKey, details.value, 'object')
      );
    }
  }

  private async evaluate<T>(
    flagKey: string,
    identity: Identity
  ): Promise<ProviderEvaluation<T>> {
    const value = identity.identifier
      ? (
          await this.client.getIdentityFlags(
            identity.identifier,
            identity.traits
          )
        ).getFeatureValue(flagKey)
      : (await this.client.getEnvironmentFlags()).getFeatureValue(flagKey);
    return {
      value,
      reason: Reason.UNKNOWN,
    };
  }

  private getFlagTypeErrorMessage(
    flagKey: string,
    value: unknown,
    expectedType: string
  ) {
    return `Flag value ${flagKey} had unexpected type ${typeof value}, expected ${expectedType}.`;
  }
}
