import { parseValidJsonObject } from '@openfeature/extra';
import {
  Provider,
  EvaluationContext,
  ResolutionDetails,
  ProviderOptions,
} from '@openfeature/openfeature-js';
import { setup, dynamicApi } from 'rox-node';

export interface CloudbeesProviderOptions extends ProviderOptions {
  appKey: string;
}

/**
 * NOTE: This is an unofficial provider that was created for demonstration
 * purposes only. The playground environment will be updated to use official
 * providers once they're available.
 */
export class CloudbeesProvider implements Provider {
  metadata = {
    name: 'cloudbees',
  };
  private initialized: Promise<void>;

  constructor(options: CloudbeesProviderOptions) {
    // we don't expose any init events at the moment (we might later) so for now, lets create a private
    // promise to await into before we evaluate any flags.
    this.initialized = new Promise((resolve) => {
      setup(options.appKey, {}).then(() => {
        console.log(`CloudBees Provider initialized: appKey ${options.appKey}`);
        resolve();
      });
    });
  }

  async resolveBooleanEvaluation(
    flagKey: string,
    defaultValue: boolean,
    context: EvaluationContext
  ): Promise<ResolutionDetails<boolean>> {
    await this.initialized;
    return {
      value: dynamicApi.isEnabled(flagKey, defaultValue, context),
    };
  }

  async resolveStringEvaluation(
    flagKey: string,
    defaultValue: string,
    context: EvaluationContext
  ): Promise<ResolutionDetails<string>> {
    await this.initialized;
    return {
      value: dynamicApi.value(flagKey, defaultValue, context),
    };
  }

  async resolveNumberEvaluation(
    flagKey: string,
    defaultValue: number,
    context: EvaluationContext
  ): Promise<ResolutionDetails<number>> {
    await this.initialized;
    return {
      value: dynamicApi.getNumber(flagKey, defaultValue, context),
    };
  }

  async resolveObjectEvaluation<U extends object>(
    flagKey: string,
    defaultValue: U,
    context: EvaluationContext
  ): Promise<ResolutionDetails<U>> {
    await this.initialized;

    /**
     * NOTE: objects are not supported in Cloudbees Feature Management, for demo purposes, we use the string API,
     * and stringify the default.
     * This may not be performant, and other, more elegant solutions should be considered.
     */
    const value = dynamicApi.value(
      flagKey,
      JSON.stringify(defaultValue),
      context
    );
    return {
      value: parseValidJsonObject(value),
    };
  }
}
