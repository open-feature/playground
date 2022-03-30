import {
  Context,
  FeatureProvider, parseValidJsonObject
} from '@openfeature/openfeature-js';
import * as Rox from 'rox-node';

export class CloudbeesProvider implements FeatureProvider {
  name = 'cloudbees';
  private initialized: Promise<void>;

  constructor(readonly appKey: string) {
    // we don't expose any init events at the moment (we might later) so for now, lets create a private
    // promise to await into before we evaluate any flags.
    this.initialized = new Promise((resolve) => {
      Rox.setup(appKey, {}).then(() => {
        console.log(`CloudBees Provider initialized: appKey ${appKey}`);
        resolve();
      });
    });
  }
 
  /**
   * CloudBees Feature Management also defines a default value for a flag in code.
   * This default value is returned by the SDK if the flag is not enabled ('targeting' is off)
   * See https://docs.cloudbees.com/docs/cloudbees-feature-management/latest/feature-flags/flag-default-values
  **/
  async isEnabled(flagId: string, defaultValue: boolean, context?: Context): Promise<boolean> {
    // for CloudBees Feature Management, isEnabled is functionally equal to getBooleanValue. 
    return this.getBooleanValue(flagId, defaultValue, context);
  }

  async getBooleanValue(flagId: string, defaultValue: boolean, context?: Context): Promise<boolean> {
    await this.initialized;
    return Rox.dynamicApi.isEnabled(flagId, defaultValue, context);
  }

  async getStringValue(flagId: string, defaultValue: string, context?: Context): Promise<string> {
    await this.initialized;
    return Rox.dynamicApi.value(flagId, defaultValue, context);
  }

  async getNumberValue(flagId: string, defaultValue: number, context?: Context): Promise<number> {
    await this.initialized;
    return Rox.dynamicApi.getNumber(flagId, defaultValue, context);
  }

  async getObjectValue<T extends object>(flagId: string, defaultValue: T, context?: Context): Promise<T> {
    await this.initialized;
    
    /**
     * NOTE: objects are not supported in Cloudbees Feature Management, for demo purposes, we use the string API,
     * and stringify the default.
     * This may not be performant, and other, more elegant solutions should be considered.
     */
    const value =  Rox.dynamicApi.value(flagId, JSON.stringify(defaultValue), context);
    return parseValidJsonObject(value);
  }
}