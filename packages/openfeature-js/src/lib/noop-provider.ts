import { FeatureProvider, ProviderEvaluation, Reason } from './types';
import { noopContextTransformer } from './utils';

class NoopFeatureProvider implements FeatureProvider {
  isEnabledEvaluation(
    _: string,
    defaultValue: boolean
  ): Promise<ProviderEvaluation<boolean>> {
    return Promise.resolve({
      value: defaultValue,
      reason: Reason.DEFAULT,
    });
  }
  readonly name = 'No-op Provider';

  contextTransformer = noopContextTransformer;

  isEnabled(_: string, defaultValue: boolean): Promise<boolean> {
    return Promise.resolve(defaultValue);
  }

  getBooleanEvaluation(
    _: string,
    defaultValue: boolean
  ): Promise<ProviderEvaluation<boolean>> {
    return this.noOp(defaultValue);
  }

  getStringEvaluation(
    _: string,
    defaultValue: string
  ): Promise<ProviderEvaluation<string>> {
    return this.noOp(defaultValue);
  }

  getNumberEvaluation(
    _: string,
    defaultValue: number
  ): Promise<ProviderEvaluation<number>> {
    return this.noOp(defaultValue);
  }

  getObjectEvaluation<T extends object>(
    _: string,
    defaultValue: T
  ): Promise<ProviderEvaluation<T>> {
    return this.noOp<T>(defaultValue);
  }

  private noOp<T>(defaultValue: T) {
    return Promise.resolve({
      value: defaultValue,
      reason: Reason.DEFAULT,
    });
  }
}

export const NOOP_FEATURE_PROVIDER = new NoopFeatureProvider();
