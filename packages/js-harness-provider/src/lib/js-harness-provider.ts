import { Client, Target } from '@harnessio/ff-nodejs-server-sdk';
import { EvaluationContext, Provider, ResolutionDetails, JsonValue } from '@openfeature/js-sdk';

/**
 * NOTE: This is an unofficial provider that was created for demonstration
 * purposes only. The playground environment will be updated to use official
 * providers once they're available.
 */
export class OpenFeatureHarnessProvider implements Provider {
  metadata = {
    name: 'harness',
  };

  constructor(private readonly client: Client) {}

  async resolveBooleanEvaluation(
    flagKey: string,
    defaultValue: boolean,
    context: EvaluationContext
  ): Promise<ResolutionDetails<boolean>> {
    const value = await this.client.boolVariation(
      this.flagKeyCharConvert(flagKey),
      this.transformContext(context),
      defaultValue
    );

    return {
      value,
    };
  }

  async resolveStringEvaluation(
    flagKey: string,
    defaultValue: string,
    context: EvaluationContext
  ): Promise<ResolutionDetails<string>> {
    const value = await this.client.stringVariation(
      this.flagKeyCharConvert(flagKey),
      this.transformContext(context),
      defaultValue
    );

    return {
      value,
    };
  }

  async resolveNumberEvaluation(
    flagKey: string,
    defaultValue: number,
    context: EvaluationContext
  ): Promise<ResolutionDetails<number>> {
    const value = await this.client.numberVariation(
      this.flagKeyCharConvert(flagKey),
      this.transformContext(context),
      defaultValue
    );

    return {
      value,
    };
  }

  async resolveObjectEvaluation<U extends JsonValue>(
    flagKey: string,
    defaultValue: U,
    context: EvaluationContext
  ): Promise<ResolutionDetails<U>> {
    const value = (await this.client.jsonVariation(
      this.flagKeyCharConvert(flagKey),
      this.transformContext(context),
      defaultValue || {}
      // TODO see if type casting can be avoided
    )) as unknown as U;

    return {
      value,
    };
  }

  /**
   * Harness enforces restrictions on the the flag key. Converting existing flag keys
   * into a format that's supported.
   *
   * @see https://docs.harness.io/article/li0my8tcz3-entity-identifier-reference
   */
  private flagKeyCharConvert(flagKey: string): string {
    return flagKey.replace(/-/g, '').toLowerCase();
  }

  /**
   * Attempts to transform evaluation context into the format Harness expects.
   */
  private transformContext(context: EvaluationContext): Target {
    console.log(context);
    const { targetingKey: identifier, ...attributes } = context;

    if (!identifier) {
      throw new Error('Targeting key is required');
    }

    const sanitizedAttributes = JSON.parse(JSON.stringify(attributes));

    const transformedContext: Target = {
      identifier,
      name: typeof sanitizedAttributes['name'] === 'string' ? sanitizedAttributes['name'] : identifier,
      anonymous: !!identifier,
      attributes: sanitizedAttributes,
    };

    return transformedContext;
  }
}
