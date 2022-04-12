import {
  FeatureProvider,
  FlagNotFoundError,
  noopContextTransformer,
  parseValidBoolean,
  parseValidJsonObject,
  parseValidNumber,
  ProviderEvaluation,
  Reason,
} from '@openfeature/openfeature-js';
import { constantCase } from 'change-case';

export class OpenFeatureEnvProvider implements FeatureProvider {
  isEnabledEvaluation(flagKey: string): Promise<ProviderEvaluation<boolean>> {
    const details = this.evaluateEnvironmentVariable(flagKey);
    return Promise.resolve({
      ...details,
      value: parseValidBoolean(details.value),
    });
  }

  getBooleanEvaluation(flagKey: string): Promise<ProviderEvaluation<boolean>> {
    const details = this.evaluateEnvironmentVariable(flagKey);
    return Promise.resolve({
      ...details,
      value: parseValidBoolean(details.value),
    });
  }
  async getStringEvaluation(
    flagKey: string
  ): Promise<ProviderEvaluation<string>> {
    return Promise.resolve(this.evaluateEnvironmentVariable(flagKey));
  }

  getNumberEvaluation(flagKey: string): Promise<ProviderEvaluation<number>> {
    const details = this.evaluateEnvironmentVariable(flagKey);
    return Promise.resolve({
      ...details,
      value: parseValidNumber(details.value),
    });
  }

  getObjectEvaluation<U extends object>(
    flagKey: string
  ): Promise<ProviderEvaluation<U>> {
    const details = this.evaluateEnvironmentVariable(flagKey);
    return Promise.resolve({
      ...details,
      value: parseValidJsonObject(details.value),
    });
  }
  name = ' environment variable';
  readonly contextTransformer = noopContextTransformer;

  evaluateEnvironmentVariable(key: string): ProviderEvaluation<string> {
    // convert key to ENV_VAR style casing
    const envVarCaseKey = constantCase(key);
    const value = process.env[envVarCaseKey];
    if (!value) {
      throw new FlagNotFoundError();
    }
    return {
      value: value,
      reason: Reason.DEFAULT,
    };
  }
}
