import {
  FeatureProvider,
  FlagEvaluationRequest,
  FlagEvaluationVariationResponse,
} from '@openfeature/openfeature-js';
import type { IClient } from '@splitsoftware/splitio/types/splitio';

export class OpenFeatureSplitProvider implements FeatureProvider {
  name = 'split';

  constructor(private readonly client: IClient) {}

  async evaluateFlag(
    request: FlagEvaluationRequest
  ): Promise<FlagEvaluationVariationResponse> {
    console.log(`${this.name}: evaluation flag`);

    const flagValue = this.client.getTreatment(
      request.context.userId ?? 'anonymous',
      request.flagId
    );

    console.log(`Flag '${request.flagId}' has a value of '${flagValue}'`);
    /**
     * Split uses strings for treatment values. On and off are default but the
     * values can be changed. "control" is a reserved treatment value and means
     * something went wrong.
     */
    return {
      enabled: !!flagValue,
      boolValue:
        typeof flagValue === 'string' &&
        !['off', 'control'].includes(flagValue.toLowerCase()),
      stringValue: flagValue,
    };
  }
}
