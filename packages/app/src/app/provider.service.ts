import { Injectable } from '@nestjs/common';
import { FlagdProvider } from '@openfeature/flagd-provider';
import { CloudbeesProvider } from '@openfeature/js-cloudbees-provider';
import { OpenFeatureEnvProvider } from '@openfeature/js-env-provider';
// import { FlagsmithV1Provider } from '@openfeature/js-flagsmith-v1-provider';
// import { FlagsmithV2Provider } from '@openfeature/js-flagsmith-v2-provider';
import { GoFeatureFlagProvider } from '@openfeature/go-feature-flag-provider';
// import { JsonProvider } from '@openfeature/js-json-provider';
import { OpenFeatureLaunchDarklyProvider } from '@openfeature/js-launchdarkly-provider';
import { OpenFeature, Provider } from '@openfeature/js-sdk';
import { OpenFeatureSplitProvider } from '@openfeature/js-split-provider';
import { SplitFactory } from '@splitsoftware/splitio';
import { ProviderIds } from './constants';
// import { Flagsmith } from 'flagsmithv2';
// import * as Flagsmith from "flagsmith-nodejs";
 

@Injectable()
export class MessageService {
  constructor(
    // @Inject(OPENFEATURE_CLIENT) private client: Client,
    // @Inject(REQUEST_DATA) private attributes: any
  ) {
    //
  }


  private updateProvider(providerId: ProviderIds) {
    let provider: Provider | undefined = undefined;
  
    switch (providerId) {
      case 'env':
        provider = new OpenFeatureEnvProvider();
        break;
  
      // case 'json':
      //   provider = new JsonProvider();
      //   break;
  
      case 'flagd':
        console.log('configuring flagd');
        // provider = new FlagdProvider({ host: 'flagd' });
        provider = new FlagdProvider();
        break;
  
      case 'cloudbees': {
        const appKey = process.env.CLOUDBEES_APP_KEY;
        if (!appKey) {
          console.error('"CLOUDBEES_APP_KEY" must be defined.');
        } else {
          provider = new CloudbeesProvider({
            appKey,
          });
        }
        break;
      }
  
      // case 'flagsmith': {
      //   const environmentKey = process.env.FLAGSMITH_ENV_KEY;
      //   if (!environmentKey) {
      //     console.error('"FLAGSMITH_ENV_KEY" must be defined.');
      //   } else {
      //     const client = new Flagsmith({
      //       environmentKey,
      //       enableLocalEvaluation: true,
      //       environmentRefreshIntervalSeconds: 5,
      //     });
      //     provider = new FlagsmithV2Provider({
      //       client,
      //     });
      //   }
      //   break;
      // }
  
      case 'launchdarkly': {
        const sdkKey = process.env.LD_KEY;
        if (!sdkKey) {
          console.error('"LD_KEY" must be defined.');
        } else {
          provider = new OpenFeatureLaunchDarklyProvider({
            sdkKey,
          });
        }
        break;
      }
  
      case 'split': {
        const authorizationKey = process.env.SPLIT_KEY;
        if (!authorizationKey) {
          console.error('"LD_KEY" must be defined.');
        } else {
          const splitClient = SplitFactory({
            core: {
              authorizationKey,
            },
          }).client();
          provider = new OpenFeatureSplitProvider({
            splitClient,
          });
        }
        break;
      }
  
      case 'go': {
        provider = new GoFeatureFlagProvider({
          endpoint: 'http://localhost:1031',
        });
        break;
      }
    }
  
    if (provider) {
      OpenFeature.setProvider(provider);
    } else {
      console.warn('No provider set, falling back to no-op');
    }
  }
}
