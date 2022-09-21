import { ParseError, parseValidJsonObject, TypeMismatchError } from '@openfeature/extra';
import { EvaluationContextValue, JsonValue } from '@openfeature/js-sdk';
import { EvaluationContext, Provider, ResolutionDetails } from '@openfeature/openfeature-js';
import { Flagsmith } from 'flagsmithv2';

type Identity = {
  identifier?: string;
  traits?: Record<string, EvaluationContextValue>;
};

export interface FlagsmithV2ProviderOptions {
  client: Flagsmith;
}

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
export class FlagsmithV2Provider implements Provider {
  metadata = {
    name: 'flagsmith-v2',
  };

  private client: Flagsmith;

  constructor(options: FlagsmithV2ProviderOptions) {
    this.client = options.client;
    console.log(`${this.metadata.name} provider initialized`);
  }

  async resolveBooleanEvaluation(
    flagKey: string,
    _: boolean,
    context: EvaluationContext
  ): Promise<ResolutionDetails<boolean>> {
    const details = await this.evaluate(flagKey, this.transformContext(context));
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
    const details = await this.evaluate(flagKey, this.transformContext(context));
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
    const details = await this.evaluate(flagKey, this.transformContext(context));
    if (typeof details.value === 'number') {
      const value = details.value;
      return { ...details, value };
    } else {
      throw new TypeMismatchError(this.getFlagTypeErrorMessage(flagKey, details.value, 'number'));
    }
  }

  async resolveObjectEvaluation<U extends JsonValue>(
    flagKey: string,
    _: U,
    context: EvaluationContext
  ): Promise<ResolutionDetails<U>> {
    const details = await this.evaluate(flagKey, this.transformContext(context));
    if (typeof details.value === 'string') {
      // we may want to allow the parsing to be customized.
      try {
        return {
          value: parseValidJsonObject(details.value),
        };
      } catch (err) {
        throw new ParseError(`Error parsing flag value for ${flagKey}`);
      }
    } else {
      throw new TypeMismatchError(this.getFlagTypeErrorMessage(flagKey, details.value, 'object'));
    }
  }

  // Transform the context into an object useful for the v2 Flagsmith API, an identifier string with a "dictionary" of traits.
  private transformContext(context: EvaluationContext): Identity {
    const { targetingKey, ...traits } = context;
    return {
      identifier: targetingKey,
      traits,
    };
  }

  private async evaluate<T>(flagKey: string, identity: Identity): Promise<ResolutionDetails<T>> {
    const value = identity.identifier
      ? (await this.client.getIdentityFlags(identity.identifier, identity.traits)).getFeatureValue(flagKey)
      : (await this.client.getEnvironmentFlags()).getFeatureValue(flagKey);
    return {
      value,
    };
  }

  private getFlagTypeErrorMessage(flagKey: string, value: unknown, expectedType: string) {
    return `Flag value ${flagKey} had unexpected type ${typeof value}, expected ${expectedType}.`;
  }
}
