import { FeatureProvider, FlagEvaluationResponse } from './types';

class NoopFeatureProvider implements FeatureProvider {
  name = 'No-op Provider';

  async evaluateFlag(): Promise<FlagEvaluationResponse> {
    return { enabled: false };
  }
}

export const NOOP_FEATURE_PROVIDER = new NoopFeatureProvider();
