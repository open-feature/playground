import {
  Context,
  ContextTransformer,
  FeatureProvider,
  FlagEvaluationOptions,
  FlagTypeError,
  FlagValueParseError,
  ProviderOptions,
} from '@openfeature/openfeature-js';
import Flagsmith from 'flagsmithv2';

type Identity = {
  identifier?: string;
  traits?: { [key: string]: boolean | number | string };
}

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
    traits
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
    this.contextTransformer = options.contextTransformer || DEFAULT_CONTEXT_TRANSFORMER;
    console.log(`${this.name} provider initialized`);
  }

  /*
  * Flagsmith differentiates between flag activity and boolean flag values, so in this provider,`isEnabled` is NOT a proxy to `getBooleanValue`.
  */
  async isEnabled(
    flagId: string,
    _defaultValue: boolean,
    identity: Identity,
    _options?: FlagEvaluationOptions
  ): Promise<boolean> {
    const value = identity.identifier
      ? (await this.client.getIdentityFlags(identity.identifier, identity.traits)).isFeatureEnabled(flagId)
      : (await this.client.getEnvironmentFlags()).isFeatureEnabled(flagId);
    if (typeof value === 'boolean') {
      return value;
    } else {
      throw new FlagTypeError(
        this.getFlagTypeErrorMessage(flagId, value, 'boolean')
      );
    }
  }

  async getBooleanValue(
    flagId: string,
    _defaultValue: boolean,
    identity: Identity,
    _options?: FlagEvaluationOptions
  ): Promise<boolean> {
    const value = await this.getValue(flagId, identity);
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
    _defaultValue: string,
    identity: Identity,
    _options?: FlagEvaluationOptions
  ): Promise<string> {
    const value = await this.getValue(flagId, identity);
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
    _defaultValue: number,
    identity: Identity,
    _options?: FlagEvaluationOptions
  ): Promise<number> {
    const value = await this.getValue(flagId, identity);
    if (typeof value === 'number') {
      return value;
    } else {
      throw new FlagTypeError(
        this.getFlagTypeErrorMessage(flagId, value, 'number')
      );
    }
  }

  async getObjectValue<T extends object>(
    flagId: string,
    _defaultValue: T,
    identity: Identity,
    _options?: FlagEvaluationOptions
  ): Promise<T> {
    const value = await this.getValue(flagId, identity);
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

  private async getValue(flagId: string, identity: Identity) {
    return identity.identifier
    ? (await this.client.getIdentityFlags(identity.identifier, identity.traits)).getFeatureValue(flagId)
    : (await this.client.getEnvironmentFlags()).getFeatureValue(flagId);
  }

  private getFlagTypeErrorMessage(
    flagId: string,
    value: unknown,
    expectedType: string
  ) {
    return `Flag value ${flagId} had unexpected type ${typeof value}, expected ${expectedType}.`;
  }
}
