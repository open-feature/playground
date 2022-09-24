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
import { ProviderId } from './constants';
// import { Flagsmith } from 'flagsmithv2';
// import * as Flagsmith from "flagsmith-nodejs";
 

@Injectable()
export class ProviderService {

  private _currentProvider: ProviderId
  private providerMap: Partial<Record<ProviderId, Provider>> = {};

  constructor() {
    this._currentProvider = process.argv[2] as ProviderId;
    this.switchProvider(this._currentProvider as ProviderId);
  }

  // private retreiveOrCreate(providerId: ProviderIds) {
  //   if (!this.providerMap[providerId]) {
  //     this.providerMap[providerId] = 
  //   }
  // }

  get currentProvider() {
    return this._currentProvider;
  };
  
  // this could be simplified
  switchProvider(providerId: ProviderId) {
    let provider: Provider | undefined = undefined;
  
    switch (providerId) {
      case 'env':
        provider = this.providerMap[providerId] || this.addToMap(providerId, new OpenFeatureEnvProvider());
        break;
  
      // case 'json':
      //   provider = new JsonProvider();
      //   break;
  
      case 'flagd':
        console.log('configuring flagd');
        // provider = new FlagdProvider({ host: 'flagd' });
        provider = this.providerMap[providerId] || this.addToMap(providerId, new FlagdProvider());
        break;
  
      case 'cloudbees': {
        const appKey = process.env.CLOUDBEES_APP_KEY;
        if (!appKey) {
          console.error('"CLOUDBEES_APP_KEY" must be defined.');
        } else {
          provider = this.providerMap[providerId] || this.addToMap(providerId, new CloudbeesProvider({
            appKey,
          }));
        }
        break;
      }
  
      case 'launchdarkly': {
        const sdkKey = process.env.LD_KEY;
        if (!sdkKey) {
          console.error('"LD_KEY" must be defined.');
        } else {
          provider = this.providerMap[providerId] || this.addToMap(providerId, new OpenFeatureLaunchDarklyProvider({
            sdkKey,
          }));
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
          provider = this.providerMap[providerId] || this.addToMap(providerId, new OpenFeatureSplitProvider({
            splitClient,
          }));
        }
        break;
      }
  
      case 'go': {
        provider = this.providerMap[providerId] || this.addToMap(providerId, new GoFeatureFlagProvider({
          endpoint: 'http://localhost:1031',
        }));
        break;
      }
    }
  
    if (provider) {
      OpenFeature.setProvider(provider);
      this._currentProvider = providerId;
    } else {
      console.warn('No provider set, falling back to no-op');
    }
  }
  
  private addToMap(providerId: ProviderId, provider: Provider) {
    this.providerMap[providerId] = provider;
    return provider;
  }

}
