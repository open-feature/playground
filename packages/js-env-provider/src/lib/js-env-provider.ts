import {
  FeatureProvider,
  FlagEvaluationRequest,
  FlagEvaluationResponse,
} from '@openfeature/openfeature-js';

export class OpenFeatureEnvProvider implements FeatureProvider {
  name = 'environment variable';

  async evaluateFlag(
    request: FlagEvaluationRequest
  ): Promise<FlagEvaluationResponse> {
    console.log(`${this.name}: evaluation flag`);
    const flagValue = process.env[request.flagId];

    console.log(`Flag '${request.flagId}' has a value of '${flagValue}'`);
    return {
      enabled:
        typeof flagValue === 'string' && flagValue.toLowerCase() === 'true',
    };
  }
}
