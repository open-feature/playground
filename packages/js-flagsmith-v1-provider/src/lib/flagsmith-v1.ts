import {
  Context,
  FeatureProvider,
  FlagEvaluationOptions,
  FlagTypeError,
  FlagValueParseError,
} from '@openfeature/openfeature-js';
import * as flagsmith from 'flagsmith-nodejs';

export class FlagsmithV1Provider implements FeatureProvider {
  name = 'flagsmith-v1';

  constructor(readonly environmentID: string) {
    flagsmith.init({
      environmentID,
    });
    console.log(`${this.name} provider initialized`);
  }

  async isEnabled(
    flagId: string,
    defaultValue: boolean,
    context: Context,
    options?: FlagEvaluationOptions
  ): Promise<boolean> {
    const value = await flagsmith.hasFeature(flagId, context?.['userId'] as string);
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
    defaultValue: boolean,
    context: Context,
    options?: FlagEvaluationOptions
  ): Promise<boolean> {
    // TODO: talk about this semantic difference.
    const value = await flagsmith.getValue(flagId, context?.['userId'] as string);
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
    defaultValue: string,
    context: Context,
    options?: FlagEvaluationOptions
  ): Promise<string> {
    const value = await flagsmith.getValue(flagId, context?.['userId'] as string);
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
    defaultValue: number,
    context: Context,
    options?: FlagEvaluationOptions
  ): Promise<number> {
    const value = await flagsmith.getValue(flagId, context?.['userId'] as string);
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
    defaultValue: T,
    context: Context,
    options?: FlagEvaluationOptions
  ): Promise<T> {
    const value = await flagsmith.getValue(flagId, context?.['userId'] as string);
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

  private getFlagTypeErrorMessage(
    flagId: string,
    value: unknown,
    expectedType: string
  ) {
    return `Flag value ${flagId} had unexpected type ${typeof value}, expected ${expectedType}.`;
  }
}
