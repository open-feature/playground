import { Context, FeatureProvider, FlagEvaluationOptions } from './types';
import { noopContextTransformer } from './utils';

class NoopFeatureProvider implements FeatureProvider {

  readonly name = 'No-op Provider';

  contextTransformer = noopContextTransformer;

  isEnabled(id: string, defaultValue: boolean, context: Context | undefined, options?: FlagEvaluationOptions): Promise<boolean> {
    return Promise.resolve(defaultValue);
  }
  getBooleanValue(flagId: string, defaultValue: boolean, context: Context | undefined, options?: FlagEvaluationOptions): Promise<boolean> {
    return Promise.resolve(defaultValue);
  }
  getStringValue(flagId: string, defaultValue: string, context: Context | undefined, options?: FlagEvaluationOptions): Promise<string> {
    return Promise.resolve(defaultValue);
  }
  getNumberValue(flagId: string, defaultValue: number, context: Context | undefined, options?: FlagEvaluationOptions): Promise<number> {
    return Promise.resolve(defaultValue);
  }
  getObjectValue<T extends object>(flagId: string, defaultValue: T, context: Context | undefined, options?: FlagEvaluationOptions): Promise<T> {
    return Promise.resolve(defaultValue);
  }
}

export const NOOP_FEATURE_PROVIDER = new NoopFeatureProvider();
