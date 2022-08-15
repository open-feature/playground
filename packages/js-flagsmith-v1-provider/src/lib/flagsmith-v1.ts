import { ParseError, TypeMismatchError } from '@openfeature/extra';
import { EvaluationContext, Provider, ResolutionDetails } from '@openfeature/openfeature-js';
import * as flagsmith from 'flagsmith-nodejs';

export interface FlagsmithProviderOptions {
  environmentID: string;
}

const ANONYMOUS = 'anonymous';

/*
 * NOTE: This is an unofficial provider that was created for demonstration
 * purposes only. The playground environment will be updated to use official
 * providers once they're available.
 *
 * Minimum provider for Flagsmith.
 *
 * NOTE: Flagsmith differentiates between flag activity and boolean flag values, so in this provider, `isEnabled`
 * is NOT a proxy to `getBooleanValue`.
 *
 * NOTE: Flagsmith defaults values to `null` and booleans to false. In this provider implementation, this will result in
 * a `FlagTypeError` for undefined flags, which in turn will result in the default passed to OpenFeature being used.
 */
export class FlagsmithV1Provider implements Provider {
  metadata = {
    name: 'flagsmith-v1',
  };

  constructor(options: FlagsmithProviderOptions) {
    flagsmith.init({
      environmentID: options.environmentID,
    });
    console.log(`${this.metadata.name} provider initialized`);
  }

  async resolveBooleanEvaluation(
    flagKey: string,
    _: boolean,
    context: EvaluationContext
  ): Promise<ResolutionDetails<boolean>> {
    const details = await this.evaluate(flagKey, await this.transformContext(context));
    if (typeof details.value === 'boolean') {
      const value = details.value;
      return { ...details, value };
    } else {
      throw new TypeMismatchError(this.getFlagTypeErrorMessage(flagKey, details.value, 'boolean'));
    }
  }

  async resolveStringEvaluation(
    flagKey: string,
    _: string,
    context: EvaluationContext
  ): Promise<ResolutionDetails<string>> {
    const details = await this.evaluate(flagKey, await this.transformContext(context));
    if (typeof details.value === 'string') {
      const value = details.value;
      return { ...details, value };
    } else {
      throw new TypeMismatchError(this.getFlagTypeErrorMessage(flagKey, details.value, 'string'));
    }
  }

  async resolveNumberEvaluation(
    flagKey: string,
    _: number,
    context: EvaluationContext
  ): Promise<ResolutionDetails<number>> {
    const details = await this.evaluate(flagKey, await this.transformContext(context));
    if (typeof details.value === 'number') {
      const value = details.value;
      return { ...details, value };
    } else {
      throw new TypeMismatchError(this.getFlagTypeErrorMessage(flagKey, details.value, 'number'));
    }
  }

  async resolveObjectEvaluation<U extends object>(
    flagKey: string,
    _: U,
    context: EvaluationContext
  ): Promise<ResolutionDetails<U>> {
    const details = await this.evaluate(flagKey, await this.transformContext(context));
    if (typeof details.value === 'string') {
      // we may want to allow the parsing to be customized.
      try {
        return {
          value: JSON.parse(details.value),
        };
      } catch (err) {
        throw new ParseError(`Error parsing flag value for ${flagKey}`);
      }
    } else {
      throw new TypeMismatchError(this.getFlagTypeErrorMessage(flagKey, details.value, 'object'));
    }
  }

  /**
   * Additional custom properties in Flagsmith are associated with the user (traits), and not passed directly to the flag evaluation.
   * This is a very basic transformer function that defines Flagsmith traits based on the OpenFeature context. Note that it
   * doesn't handle nested properties.
   * */
  private async transformContext(context: EvaluationContext): Promise<string> {
    {
      // flagsmith requires a userId for any rule evaluation, so let's set it to anonymous in our demo implementation.
      const userId = context?.targetingKey || ANONYMOUS;
      const promises = Object.keys(context).map((key) => {
        if (
          key !== 'userId' &&
          (typeof context[key] === 'boolean' || typeof context[key] === 'string' || typeof context[key] === 'number')
        ) {
          // there's a bug in Flagsmith's typings, this should return a promise.
          const value = context[key];
          if (value) {
            // flagsmith seems to have a bug with some numeric values, converting to string.
            return flagsmith.setTrait(userId, key, `${value}`);
          }
        }
        return Promise.resolve();
      });
      await Promise.all(promises);
      return userId;
    }
  }

  private async evaluate(flagKey: string, userId: string): Promise<ResolutionDetails<boolean | string | number>> {
    const value = await flagsmith.getValue(flagKey, userId);
    return { value };
  }

  private getFlagTypeErrorMessage(flagKey: string, value: unknown, expectedType: string) {
    return `Flag value ${flagKey} had unexpected type ${typeof value}, expected ${expectedType}.`;
  }
}
