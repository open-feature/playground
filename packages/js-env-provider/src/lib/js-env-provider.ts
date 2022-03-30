import {
  Context,
  FeatureProvider, FlagTypeError,
  FlagValueParseError,
  parseValidBoolean,
  parseValidNumber
} from '@openfeature/openfeature-js';
import { constantCase } from 'change-case';

export class OpenFeatureEnvProvider implements FeatureProvider {

  name =' environment variable';
  
  isEnabled(flagId: string, defaultValue: boolean, context?: Context): Promise<boolean> {
    return this.getBooleanValue(flagId, defaultValue, context);
  }

  getBooleanValue(flagId: string, defaultValue: boolean, context?: Context): Promise<boolean> {
    const stringValue = this.getVarValue(flagId);
    if (stringValue) {
      return Promise.resolve(parseValidBoolean(stringValue));
    } else {
      throw new FlagTypeError(`Error resolving ${flagId} from environment`);
    }
  }

  getStringValue(flagId: string, defaultValue: string, context?: Context): Promise<string> {
    const stringValue = this.getVarValue(flagId);
    if (stringValue) {
      return Promise.resolve(stringValue);
    } else {
      throw new FlagTypeError(`Error resolving ${flagId} from environment`);
    }
  }

  getNumberValue(flagId: string, defaultValue: number, context?: Context): Promise<number> {
    const stringValue = this.getVarValue(flagId);
    if (stringValue) {
      return Promise.resolve(parseValidNumber(stringValue));
    } else {
      throw new FlagTypeError(`Error resolving ${flagId} from environment`);
    }
  }

  getObjectValue<T extends object>(flagId: string, defaultValue: T, context?: Context): Promise<T> {
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
