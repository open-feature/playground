import {
  Context,
  ContextTransformer,
  FeatureProvider,
  FlagEvaluationOptions,
  FlagTypeError,
  FlagValueParseError,
  ProviderOptions,
} from '@openfeature/openfeature-js';
import * as flagsmith from 'flagsmith-nodejs';

export interface FlagsmithProviderOptions extends ProviderOptions<string | undefined> {
  environmentID: string;
}

/**
 * Additional custom properties in Flagsmith are associated with the user (traits), and not passed directly to the flag evaluation.
 * This is a very basic transformer function that defines Flagsmith traits based on the OpenFeature context. Note that it 
 * doesn't handle nested properties.
 * 
 * We may want to generalize this concept, and provide a default for all providers.
 */
const DEFAULT_CONTEXT_TRANSFORMER = (context: Context): string | undefined => {
  if (typeof context?.userId === 'string') {
    Object.keys(context).forEach((key) => {
      if (
        key !== 'userId' &&
        (typeof context[key] === 'boolean' ||
          typeof context[key] === 'string' ||
          typeof context[key] === 'number')
      ) {
        flagsmith.setTrait(context.userId as string, key, context[key]);
      }
    });
  }
  return context?.userId;
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
export class FlagsmithV1Provider implements FeatureProvider<string | undefined> {
  name = 'flagsmith-v1';
  readonly contextTransformer: ContextTransformer<string | undefined>;

  constructor(options: FlagsmithProviderOptions) {
    this.contextTransformer = options.contextTransformer || DEFAULT_CONTEXT_TRANSFORMER;
    flagsmith.init({
      environmentID: options.environmentID
    });
    console.log(`${this.name} provider initialized`);
  }

  /*
  * Flagsmith differentiates between flag activity and boolean flag values, so in this provider,`isEnabled` is NOT a proxy to `getBooleanValue`.
  */
  async isEnabled(
    flagId: string,
    _defaultValue: boolean,
    userId: string,
    _options?: FlagEvaluationOptions
  ): Promise<boolean> {
    const value = userId
      ? await flagsmith.hasFeature(flagId, userId)
      : await flagsmith.hasFeature(flagId);
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
    userId: string,
    _options?: FlagEvaluationOptions
  ): Promise<boolean> {
    const value = await this.getValue(flagId, userId);
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
    userId: string,
    _options?: FlagEvaluationOptions
  ): Promise<string> {
    const value = await this.getValue(flagId, userId);
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
    userId: string,
    _options?: FlagEvaluationOptions
  ): Promise<number> {
    const value = await this.getValue(flagId, userId);
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
    userId: string,
    _options?: FlagEvaluationOptions
  ): Promise<T> {
    const value = await this.getValue(flagId, userId);
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

  private getValue(flagId: string, userId: string) {
    return userId
      ? flagsmith.getValue(flagId, userId)
      : flagsmith.getValue(flagId);
  }

  private getFlagTypeErrorMessage(
    flagId: string,
    value: unknown,
    expectedType: string
  ) {
    return `Flag value ${flagId} had unexpected type ${typeof value}, expected ${expectedType}.`;
  }
}
