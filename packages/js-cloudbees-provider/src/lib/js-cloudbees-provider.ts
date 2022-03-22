import {
  FeatureProvider,
  FlagEvaluationRequest,
  FlagEvaluationVariationResponse,
} from '@openfeature/openfeature-js';

import * as Rox from 'rox-node';

export class CloudbeesProvider implements FeatureProvider {
  name = 'cloudbees';

  constructor(private readonly appKey: string) {
    Rox.setup(appKey, {}).then(() => {
      console.log(`CloudBees Provider initialised: appKey ${appKey}`)
    });
  }

  async evaluateFlag(
    request: FlagEvaluationRequest
  ): Promise<FlagEvaluationVariationResponse> {
    /**
     * CloudBees Feature management  uses different methods to distinguish between different types of flag.
     * See https://docs.cloudbees.com/docs/cloudbees-feature-management/latest/feature-flags/dynamic-api:
     * * Boolean flag value: Rox.dynamicApi.isEnabled
     * * String flag value:  Rox.dynamicApi.value
     * * Number flag value:  Rox.dynamicApi.getNumber
    **/

    /**
     * CloudBees Feature Management also defines a default value for a flag in code.
     * This default value is returned by the SDK if the flag is not enabled ('targeting' is off)
     * See https://docs.cloudbees.com/docs/cloudbees-feature-management/latest/feature-flags/flag-default-values
    **/
    // This assumes a boolean flag. Should we include the flag type in the request?
    const value = Rox.dynamicApi.isEnabled(request.flagId, false, request.context)

    console.log(`${this.name} flag '${request.flagId}' has a value of '${value}'`);

    return {
      enabled: true, // Cloudbees will return default values if the flag is disabled, so from a caller's perspective it is always enabled
      // Callers should not care if a flag is enabled or not
      boolValue: value,
      // stringValue: value.toString(),
      // numberValue: value,
    }
  }
}
