import { JsonValue, TypeMismatchError } from '@openfeature/js-sdk';
import { EvaluationContext, Provider, ResolutionDetails, Logger } from '@openfeature/js-sdk';
import type { Attributes, IClient } from '@splitsoftware/splitio/types/splitio';
import { parseValidNumber, parseValidJsonObject } from '@openfeature/utils';

/**
 * This simple provider implementation relies on storing all data as strings in the treatment value.
 *
 * It may be more idiomatic to only rely on that for the "isEnabled" calls,
 * and for all values store the data in the associated "split config" JSON.
 */
export interface SplitProviderOptions {
  splitClient: IClient;
  logger: Logger;
}

type Consumer = {
  key: string;
  attributes: Attributes;
};

/**
 * NOTE: This is an unofficial provider that was created for demonstration
 * purposes only. The playground environment will be updated to use official
 * providers once they're available.
 */
export class OpenFeatureSplitProvider implements Provider {
  metadata = {
    name: 'split',
  };
  private initialized: Promise<void>;
  private client: IClient;

  constructor(options: SplitProviderOptions) {
    this.client = options.splitClient;
    // we don't expose any init events at the moment (we might later) so for now, lets create a private
    // promise to await into before we evaluate any flags.
    this.initialized = new Promise((resolve) => {
      this.client.on(this.client.Event.SDK_READY, () => {
        options.logger.info(`${this.metadata.name} provider initialized`);
        resolve();
      });
    });
  }

  async resolveBooleanEvaluation(
    flagKey: string,
    _: boolean,
    context: EvaluationContext
  ): Promise<ResolutionDetails<boolean>> {
    const details = await this.evaluateTreatment(flagKey, this.transformContext(context));

    let value: boolean;
    switch (details.value as unknown) {
      case 'on':
        value = true;
        break;
      case 'off':
        value = false;
        break;
      case 'true':
        value = true;
        break;
      case 'false':
        value = false;
        break;
      case true:
        value = true;
        break;
      case false:
        value = false;
        break;
      default:
        throw new TypeMismatchError(`Invalid boolean value for ${details.value}`);
    }
    return { ...details, value };
  }

  async resolveStringEvaluation(
    flagKey: string,
    _: string,
    context: EvaluationContext
  ): Promise<ResolutionDetails<string>> {
    return this.evaluateTreatment(flagKey, this.transformContext(context));
  }

  async resolveNumberEvaluation(
    flagKey: string,
    _: number,
    context: EvaluationContext
  ): Promise<ResolutionDetails<number>> {
    const details = await this.evaluateTreatment(flagKey, this.transformContext(context));
    return { ...details, value: parseValidNumber(details.value) };
  }

  async resolveObjectEvaluation<U extends JsonValue>(
    flagKey: string,
    _: U,
    context: EvaluationContext
  ): Promise<ResolutionDetails<U>> {
    const details = await this.evaluateTreatment(flagKey, this.transformContext(context));
    return { ...details, value: parseValidJsonObject(details.value) };
  }

  private async evaluateTreatment(flagKey: string, consumer: Consumer): Promise<ResolutionDetails<string>> {
    await this.initialized;
    const value = this.client.getTreatment(consumer.key, flagKey, consumer.attributes);
    return { value };
  }

  //Transform the context into an object useful for the Split API, an key string with arbitrary Split "Attributes".
  private transformContext(context: EvaluationContext): Consumer {
    {
      const { targetingKey, ...attributes } = context;
      return {
        key: targetingKey || 'anonymous',
        // Stringify context objects include date.
        attributes: JSON.parse(JSON.stringify(attributes)),
      };
    }
  }
}
