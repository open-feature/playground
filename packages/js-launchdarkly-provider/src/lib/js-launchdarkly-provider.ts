import { ParseError, TypeMismatchError } from '@openfeature/extra';
import { FlagValue } from '@openfeature/nodejs-sdk';
import { EvaluationContext, Provider, ResolutionDetails } from '@openfeature/openfeature-js';
import { init, LDClient, LDUser } from 'launchdarkly-node-server-sdk';

export interface LaunchDarklyProviderOptions {
  sdkKey: string;
}

/**
 * NOTE: This is an unofficial provider that was created for demonstration
 * purposes only. The playground environment will be updated to use official
 * providers once they're available.
 */
export class OpenFeatureLaunchDarklyProvider implements Provider {
  metadata = {
    name: 'LaunchDarkly',
  };

  private client: LDClient;
  private initialized: Promise<void>;

  constructor(options: LaunchDarklyProviderOptions) {
    this.client = init(options.sdkKey);

    // we don't expose any init events at the moment (we might later) so for now, lets create a private
    // promise to await into before we evaluate any flags.
    this.initialized = new Promise((resolve) => {
      this.client.once('ready', () => {
        console.log(`${this.metadata.name} provider initialized`);
        resolve();
      });
    });
  }

  async resolveBooleanEvaluation(
    flagKey: string,
    defaultValue: boolean,
    context: EvaluationContext
  ): Promise<ResolutionDetails<boolean>> {
    const details = await this.evaluateFlag<boolean>(flagKey, defaultValue, this.transformContext(context));
    if (typeof details.value === 'boolean') {
      return details;
    } else {
      throw new TypeMismatchError(this.getFlagTypeErrorMessage(flagKey, details.value, 'boolean'));
    }
  }

  async resolveStringEvaluation(
    flagKey: string,
    defaultValue: string,
    context: EvaluationContext
  ): Promise<ResolutionDetails<string>> {
    const details = await this.evaluateFlag<string>(flagKey, defaultValue, this.transformContext(context));
    if (typeof details.value === 'string') {
      return details;
    } else {
      throw new TypeMismatchError(this.getFlagTypeErrorMessage(flagKey, details.value, 'string'));
    }
  }

  async resolveNumberEvaluation(
    flagKey: string,
    defaultValue: number,
    context: EvaluationContext
  ): Promise<ResolutionDetails<number>> {
    const details = await this.evaluateFlag<number>(flagKey, defaultValue, this.transformContext(context));
    if (typeof details.value === 'number') {
      return details;
    } else {
      throw new TypeMismatchError(this.getFlagTypeErrorMessage(flagKey, details.value, 'number'));
    }
  }

  async resolveObjectEvaluation<U extends object>(
    flagKey: string,
    defaultValue: U,
    context: EvaluationContext
  ): Promise<ResolutionDetails<U>> {
    const details = await this.evaluateFlag<unknown>(
      flagKey,
      JSON.stringify(defaultValue),
      this.transformContext(context)
    );
    if (typeof details.value === 'string') {
      // we may want to allow the parsing to be customized.
      try {
        return { ...details, value: JSON.parse(details.value) as U };
      } catch (err) {
        throw new ParseError(`Error parsing flag value for ${flagKey}`);
      }
    } else {
      throw new TypeMismatchError(this.getFlagTypeErrorMessage(flagKey, details, 'object'));
    }
  }

  async getObjectEvaluation<U extends object>(
    flagKey: string,
    defaultValue: U,
    context: EvaluationContext
  ): Promise<ResolutionDetails<U>> {
    const details = await this.evaluateFlag<unknown>(
      flagKey,
      JSON.stringify(defaultValue),
      this.transformContext(context)
    );
    if (typeof details.value === 'string') {
      // we may want to allow the parsing to be customized.
      try {
        return { ...details, value: JSON.parse(details.value) as U };
      } catch (err) {
        throw new ParseError(`Error parsing flag value for ${flagKey}`);
      }
    } else {
      throw new TypeMismatchError(this.getFlagTypeErrorMessage(flagKey, details, 'object'));
    }
  }

  // Transform the context into an object compatible with the Launch Darkly API, an object with a user "key", and other attributes.
  private transformContext(context: EvaluationContext): LDUser {
    const { targetingKey, ...attributes } = context;
    return {
      key: targetingKey || 'anonymous',
      anonymous: targetingKey ? false : true,
      // later, a well-defined set of standard attributes in Openfeature should be mapped to the appropriate standard attributes LaunchDarkly.
      custom: attributes,
    } as LDUser;
  }

  private getFlagTypeErrorMessage(flagKey: string, value: unknown, expectedType: string) {
    return `Flag value ${flagKey} had unexpected type ${typeof value}, expected ${expectedType}.`;
  }

  // LD values can be boolean, number, or string: https://docs.launchdarkly.com/sdk/client-side/node-js#getting-started
  private async evaluateFlag<T>(flagKey: string, defaultValue: FlagValue, user: LDUser): Promise<ResolutionDetails<T>> {
    // await the initialization before actually calling for a flag.
    await this.initialized;

    const details = await this.client.variationDetail(flagKey, user, defaultValue);
    return {
      value: details.value,
      variant: details.variationIndex?.toString(),
      reason: details.reason.kind,
    };
  }
}
