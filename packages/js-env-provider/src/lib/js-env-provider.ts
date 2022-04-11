import {
  Context,
  FeatureProvider,
  FlagEvaluationOptions,
  FlagTypeError,
  FlagValueParseError,
  noopContextTransformer,
  parseValidBoolean,
  parseValidNumber,
} from '@openfeature/openfeature-js';
import { constantCase } from 'change-case';

export class OpenFeatureEnvProvider implements FeatureProvider {
  name = ' environment variable';
  readonly contextTransformer = noopContextTransformer;

  isEnabled(
    flagId: string,
    defaultValue: boolean,
    context: Context,
    options?: FlagEvaluationOptions
  ): Promise<boolean> {
    return this.getBooleanValue(flagId, defaultValue, context, options);
  }

  getBooleanValue(
    flagId: string,
    _defaultValue: boolean,
    _context: Context,
    _options?: FlagEvaluationOptions
  ): Promise<boolean> {
    const stringValue = this.getVarValue(flagId);
    if (stringValue) {
      return Promise.resolve(parseValidBoolean(stringValue));
    } else {
      throw new FlagTypeError(`Error resolving ${flagId} from environment`);
    }
  }

  getStringValue(
    flagId: string,
    _defaultValue: string,
    _context: Context,
    _options?: FlagEvaluationOptions
  ): Promise<string> {
    const stringValue = this.getVarValue(flagId);
    if (stringValue) {
      return Promise.resolve(stringValue);
    } else {
      throw new FlagTypeError(`Error resolving ${flagId} from environment`);
    }
  }

  getNumberValue(
    flagId: string,
    _defaultValue: number,
    _context: Context,
    _options?: FlagEvaluationOptions
  ): Promise<number> {
    const stringValue = this.getVarValue(flagId);
    if (stringValue) {
      return Promise.resolve(parseValidNumber(stringValue));
    } else {
      throw new FlagTypeError(`Error resolving ${flagId} from environment`);
    }
  }

  getObjectValue<T extends object>(
    flagId: string,
    _defaultValue: T,
    _context: Context,
    _options?: FlagEvaluationOptions
  ): Promise<T> {
    const stringValue = this.getVarValue(flagId);
    if (stringValue) {
      try {
        const parsed = JSON.parse(stringValue);
        return Promise.resolve(parsed);
      } catch (err) {
        throw new FlagValueParseError(`Error parsing ${flagId}`);
      }
    } else {
      throw new FlagTypeError(`Error resolving ${flagId} from environment`);
    }
  }

  getVarValue(key: string): string | undefined {
    // convert key to ENV_VAR style casing
    const envVarCaseKey = constantCase(key);
    return process.env[envVarCaseKey];
  }
}
