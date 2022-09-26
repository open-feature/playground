import { Injectable } from '@nestjs/common';
import { FlagdProvider } from '@openfeature/flagd-provider';
import { CloudbeesProvider } from '@openfeature/js-cloudbees-provider';
import { OpenFeatureEnvProvider } from '@openfeature/js-env-provider';
import { GoFeatureFlagProvider } from '@openfeature/go-feature-flag-provider';
import { OpenFeatureLaunchDarklyProvider } from '@openfeature/js-launchdarkly-provider';
import { OpenFeature, Provider } from '@openfeature/js-sdk';
import { OpenFeatureSplitProvider } from '@openfeature/js-split-provider';
import { SplitFactory } from '@splitsoftware/splitio';
import { ProviderId } from './constants';

@Injectable()
export class ProviderService {
  private _currentProvider: ProviderId;
  private providerMap: Record<ProviderId, { factory: () => Provider; provider?: Provider }> = {
    env: { factory: () => new OpenFeatureEnvProvider() },
    flagd: { factory: () => new FlagdProvider() },
    launchdarkly: {
      factory: () => {
        const sdkKey = process.env.LD_KEY;
        if (!sdkKey) {
          throw new Error('"LD_KEY" must be defined.');
        } else {
          return new OpenFeatureLaunchDarklyProvider({
            sdkKey,
          });
        }
      },
    },
    cloudbees: {
      factory: () => {
        const appKey = process.env.CLOUDBEES_APP_KEY;
        if (!appKey) {
          throw new Error('"CLOUDBEES_APP_KEY" must be defined.');
        } else {
          return new CloudbeesProvider({
            appKey,
          });
        }
      },
    },
    split: {
      factory: () => {
        const authorizationKey = process.env.SPLIT_KEY;
        if (!authorizationKey) {
          throw new Error('"SPLIT_KEY" must be defined.');
        } else {
          const splitClient = SplitFactory({
            core: {
              authorizationKey,
            },
          }).client();
          return new OpenFeatureSplitProvider({
            splitClient,
          });
        }
      },
    },
    go: {
      factory: () =>
        new GoFeatureFlagProvider({
          endpoint: 'http://localhost:1031',
        }),
    },
  };

  constructor() {
    this._currentProvider = process.argv[2] as ProviderId;
    this.switchProvider(this._currentProvider as ProviderId);
  }

  get currentProvider() {
    return this._currentProvider;
  }

  switchProvider(providerId: ProviderId) {
    const provider = this.providerMap[providerId].provider || this.providerMap[providerId].factory();

    if (provider) {
      OpenFeature.setProvider(provider);
      this._currentProvider = providerId;
    } else {
      console.warn('No provider set, falling back to no-op');
    }
  }
}
