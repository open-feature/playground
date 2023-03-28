import { FlagNotFoundError, JsonValue } from '@openfeature/js-sdk';
import { Provider, ResolutionDetails } from '@openfeature/js-sdk';
import { constantCase } from 'change-case';
import { parseValidBoolean, parseValidJsonObject, parseValidNumber } from '@openfeature/utils'
/**
 * NOTE: This is an unofficial provider that was created for demonstration
 * purposes only. The playground environment will be updated to use official
 * providers once they're available.
 */
export class OpenFeatureEnvProvider implements Provider {
  metadata = {
    name: 'environment variable',
  };

  resolveBooleanEvaluation(flagKey: string): Promise<ResolutionDetails<boolean>> {
    const details = this.evaluateEnvironmentVariable(flagKey);
    return Promise.resolve({
      ...details,
      value: parseValidBoolean(details.value),
    });
  }

  resolveStringEvaluation(flagKey: string): Promise<ResolutionDetails<string>> {
    return Promise.resolve(this.evaluateEnvironmentVariable(flagKey));
  }

  resolveNumberEvaluation(flagKey: string): Promise<ResolutionDetails<number>> {
    const details = this.evaluateEnvironmentVariable(flagKey);
    return Promise.resolve({
      ...details,
      value: parseValidNumber(details.value),
    });
  }

  resolveObjectEvaluation<U extends JsonValue>(flagKey: string): Promise<ResolutionDetails<U>> {
    const details = this.evaluateEnvironmentVariable(flagKey);
    return Promise.resolve({
      ...details,
      value: parseValidJsonObject(details.value),
    });
  }

  evaluateEnvironmentVariable(key: string): ResolutionDetails<string> {
    // convert key to ENV_VAR style casing
    const envVarCaseKey = constantCase(key);
    const value = process.env[envVarCaseKey];
    if (!value) {
      throw new FlagNotFoundError();
    }
    return { value: value };
  }
}
