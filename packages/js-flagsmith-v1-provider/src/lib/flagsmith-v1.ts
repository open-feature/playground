import {
  Context,
  ContextTransformer,
  FeatureProvider,
  ParseError,
  ProviderEvaluation,
  ProviderOptions,
  Reason,
  TypeMismatchError,
} from '@openfeature/openfeature-js';
import * as flagsmith from 'flagsmith-nodejs';

export interface FlagsmithProviderOptions
  extends ProviderOptions<Promise<string & undefined>> {
  environmentID: string;
}

/**
 * Additional custom properties in Flagsmith are associated with the user (traits), and not passed directly to the flag evaluation.
 * This is a very basic transformer function that defines Flagsmith traits based on the OpenFeature context. Note that it
 * doesn't handle nested properties.
 *
 * We may want to generalize this concept, and provide a default for all providers.
 */
const DEFAULT_CONTEXT_TRANSFORMER = async (context: Context) => {
  if (typeof context?.userId === 'string') {
    const promises = Object.keys(context).map((key) => {
      if (
        key !== 'userId' &&
        (typeof context[key] === 'boolean' ||
          typeof context[key] === 'string' ||
          typeof context[key] === 'number')
      ) {
        // there's a bug in Flagsmith's typings, this should return a promise.
        return flagsmith.setTrait(context.userId as string, key, context[key]);
      }
      return Promise.resolve();
    });
    await Promise.all(promises);
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
export class FlagsmithV1Provider
  implements FeatureProvider<string | undefined>
{
  name = 'flagsmith-v1';
  readonly contextTransformer: ContextTransformer<Promise<string | undefined>>;

  constructor(options: FlagsmithProviderOptions) {
    this.contextTransformer =
      options.contextTransformer || DEFAULT_CONTEXT_TRANSFORMER;
    flagsmith.init({
      environmentID: options.environmentID,
    });
    console.log(`${this.name} provider initialized`);
  }

  /*
   * Flagsmith differentiates between flag activity and boolean flag values, so in this provider,`isEnabled` is NOT a proxy to `getBooleanValue`.
   */
  async isEnabledEvaluation(
    flagKey: string,
    _defaultValue: boolean,
    userId: string | undefined
  ): Promise<ProviderEvaluation<boolean>> {
    const value = userId
      ? await flagsmith.hasFeature(flagKey, userId)
      : await flagsmith.hasFeature(flagKey);
    return {
      value,
      reason: Reason.UNKNOWN,
    };
  }

  async getBooleanEvaluation(
    flagKey: string,
    _defaultValue: boolean,
    userId: string | undefined
  ): Promise<ProviderEvaluation<boolean>> {
    const details = await this.evaluate(flagKey, userId);
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
    userId: string | undefined
  ): Promise<ProviderEvaluation<string>> {
    const details = await this.evaluate(flagKey, userId);
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
    userId: string | undefined
  ): Promise<ProviderEvaluation<number>> {
    const details = await this.evaluate(flagKey, userId);
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
    userId: string | undefined
  ): Promise<ProviderEvaluation<U>> {
    const details = await this.evaluate(flagKey, userId);
    if (typeof details.value === 'string') {
      // we may want to allow the parsing to be customized.
      try {
        // TODO update this.
        return {
          value: JSON.parse(details.value),
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

  private async evaluate(
    flagKey: string,
    userId: string | undefined
  ): Promise<ProviderEvaluation<boolean | string | number>> {
    const value = userId
      ? await flagsmith.getValue(flagKey, userId)
      : await flagsmith.getValue(flagKey);
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
