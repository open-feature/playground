import {
  FeatureProvider,
  FlagEvaluationRequest,
  FlagEvaluationVariationResponse,
} from '@openfeature/openfeature-js';
import { LDClient, init } from 'launchdarkly-node-server-sdk';

/**
 * A comically primitive LaunchDarkly provider demo
 */
export class OpenFeatureLaunchDarklyProvider implements FeatureProvider {
  name = 'LaunchDarkly';
  private client: LDClient;
  private initialized: Promise<boolean>;

  constructor(sdkKey: string) {

    this.client = init(sdkKey);

    // we don't expose any init events at the moment (we might later) so for now, lets create a private
    // promise to await into before we evaluate any flags.
    this.initialized = new Promise((resolve) => {
      this.client.once('ready', () => {
        console.log(`${this.name}: initialization complete.`);
        resolve(true);
      });
    });
    
  }

  async evaluateFlag(
    request: FlagEvaluationRequest
  ): Promise<FlagEvaluationVariationResponse> {
    console.log(`${this.name}: evaluation flag`);

    // await the initialization before actually calling for a flag.
    await this.initialized;

    const userKey = request.context.userId  ?? 'anonymous';
    const flagValue = await this.client.variation(request.flagId, { key: userKey}, false);

    console.log(`Flag '${request.flagId}' has a value of '${flagValue}'`);
    return {
      enabled: !!flagValue,
      boolValue: !!flagValue,
      stringValue: flagValue.toString()
    };
  }
}
