import { FeatureProvider, FlagEvaluationOptions } from './types';

class NoopFeatureProvider implements FeatureProvider {

  readonly name = 'No-op Provider';

  isEnabled(id: string, defaultValue: boolean, options?: FlagEvaluationOptions): Promise<boolean> {
    return Promise.resolve(defaultValue);
  }
  getBooleanValue(flagId: string, defaultValue: boolean, options?: FlagEvaluationOptions): Promise<boolean> {
    return Promise.resolve(defaultValue);
  }
  getStringValue(flagId: string, defaultValue: string, options?: FlagEvaluationOptions): Promise<string> {
    return Promise.resolve(defaultValue);
  }
  getNumberValue(flagId: string, defaultValue: number, options?: FlagEvaluationOptions): Promise<number> {
    return Promise.resolve(defaultValue);
  }
  getObjectValue<T extends object>(flagId: string, defaultValue: T, options?: FlagEvaluationOptions): Promise<T> {
    return Promise.resolve(defaultValue);
  }
}

export const NOOP_FEATURE_PROVIDER = new NoopFeatureProvider();
