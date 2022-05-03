import {
  FeatureProvider,
  FlagNotFoundError,
  ParseError,
  ProviderEvaluation,
  TypeMismatchError,
} from '@openfeature/openfeature-js';
import { copyFileSync, existsSync } from 'fs';
import { readFile } from 'fs/promises';
import { join } from 'path';

const EXAMPLE_JSON_FILE = 'flags.json.example';
const JSON_FILE = 'flags.json';

export class JsonProvider implements FeatureProvider {
  constructor() {
    // if the .json file doesn't exist, copy the example.
    if (!existsSync(join(JSON_FILE))) {
      copyFileSync(EXAMPLE_JSON_FILE, JSON_FILE);
    }
  }

  name = 'json';

  isEnabledEvaluation(flagKey: string): Promise<ProviderEvaluation<boolean>> {
    return this.getBooleanEvaluation(flagKey);
  }

  async getBooleanEvaluation(
    flagKey: string
  ): Promise<ProviderEvaluation<boolean>> {
    const value = await this.evaluateFileValue(flagKey);
    if (typeof value === 'boolean') {
      return {
        value,
      };
    } else {
      throw new TypeMismatchError(
        this.getFlagTypeErrorMessage(flagKey, value, 'boolean')
      );
    }
  }

  async getStringEvaluation(
    flagKey: string
  ): Promise<ProviderEvaluation<string>> {
    const value = await this.evaluateFileValue(flagKey);
    if (typeof value === 'string') {
      return {
        value,
      };
    } else {
      throw new TypeMismatchError(
        this.getFlagTypeErrorMessage(flagKey, value, 'string')
      );
    }
  }

  async getNumberEvaluation(
    flagKey: string
  ): Promise<ProviderEvaluation<number>> {
    const value = await this.evaluateFileValue(flagKey);
    if (typeof value === 'number') {
      return {
        value,
      };
    } else {
      throw new TypeMismatchError(
        this.getFlagTypeErrorMessage(flagKey, value, 'number')
      );
    }
  }

  async getObjectEvaluation<U extends object>(
    flagKey: string
  ): Promise<ProviderEvaluation<U>> {
    const value = await this.evaluateFileValue(flagKey);
    if (typeof value === 'object') {
      return {
        value,
      };
    } else {
      throw new TypeMismatchError(
        this.getFlagTypeErrorMessage(flagKey, value, 'object')
      );
    }
  }

  private async evaluateFileValue(flagKey: string) {
    const fileData = await readFile(JSON_FILE);
    try {
      const json = JSON.parse(fileData.toString());
      if (flagKey in json) {
        return json[flagKey];
      } else {
        throw new FlagNotFoundError(`${flagKey} not found in JSON provider.`);
      }
    } catch (err) {
      throw new ParseError('Error parsing JSON flag data');
    }
  }

  private getFlagTypeErrorMessage(
    flagKey: string,
    value: unknown,
    expectedType: string
  ) {
    return `Flag value ${flagKey} had unexpected type ${typeof value}, expected ${expectedType}.`;
  }
}
