import {
  FeatureProvider,
  parseValidJsonObject,
  ProviderEvaluation,
  ProviderOptions,
  Reason,
} from '@openfeature/openfeature-js';
import * as Rox from 'rox-node';

export interface CloudbeesProviderOptions extends ProviderOptions {
  appKey: string;
}

export class CloudbeesProvider implements FeatureProvider {
  name = 'cloudbees';
  private initialized: Promise<void>;

  constructor(options: CloudbeesProviderOptions) {
    // we don't expose any init events at the moment (we might later) so for now, lets create a private
    // promise to await into before we evaluate any flags.
    this.initialized = new Promise((resolve) => {
      Rox.setup(options.appKey, {}).then(() => {
        console.log(`CloudBees Provider initialized: appKey ${options.appKey}`);
        resolve();
      });
    });
  }

  isEnabledEvaluation(
    flagKey: string,
    defaultValue: boolean,
    context: unknown
  ): Promise<ProviderEvaluation<boolean>> {
    return this.getBooleanEvaluation(flagKey, defaultValue, context);
  }

  async getBooleanEvaluation(
    flagKey: string,
    defaultValue: boolean,
    context: unknown
  ): Promise<ProviderEvaluation<boolean>> {
    await this.initialized;
    const value = Rox.dynamicApi.isEnabled(flagKey, defaultValue, context);
    return {
      value,
      reason: Reason.UNKNOWN,
    };
  }

  async getStringEvaluation(
    flagKey: string,
    defaultValue: string,
    context: unknown
  ): Promise<ProviderEvaluation<string>> {
    await this.initialized;
    return {
      value: Rox.dynamicApi.value(flagKey, defaultValue, context),
      reason: Reason.UNKNOWN,
    };
  }

  async getNumberEvaluation(
    flagKey: string,
    defaultValue: number,
    context: unknown
  ): Promise<ProviderEvaluation<number>> {
    await this.initialized;
    return {
      value: Rox.dynamicApi.getNumber(flagKey, defaultValue, context),
      reason: Reason.UNKNOWN,
    };
  }
  async getObjectEvaluation<U extends object>(
    flagKey: string,
    defaultValue: U,
    context: unknown
  ): Promise<ProviderEvaluation<U>> {
    await this.initialized;

    /**
     * NOTE: objects are not supported in Cloudbees Feature Management, for demo purposes, we use the string API,
     * and stringify the default.
     * This may not be performant, and other, more elegant solutions should be considered.
     */
    const value = Rox.dynamicApi.value(
      flagKey,
      JSON.stringify(defaultValue),
      context
    );
    return {
      value: parseValidJsonObject(value),
      reason: Reason.UNKNOWN,
    };
  }
}
