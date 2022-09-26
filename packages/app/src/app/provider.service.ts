import { Injectable } from '@nestjs/common';
import { FlagdProvider } from '@openfeature/flagd-provider';
import { GoFeatureFlagProvider } from '@openfeature/go-feature-flag-provider';
import { OpenFeatureEnvProvider } from '@openfeature/js-env-provider';
import { FlagsmithProvider } from '@openfeature/js-flagsmith-provider';
import { OpenFeatureLaunchDarklyProvider } from '@openfeature/js-launchdarkly-provider';
import { OpenFeature, Provider } from '@openfeature/js-sdk';
import { OpenFeatureSplitProvider } from '@openfeature/js-split-provider';
import { SplitFactory } from '@splitsoftware/splitio';
import { CloudbeesProvider } from 'cloudbees-openfeature-provider-node';
import Flagsmith from 'flagsmith-nodejs';
import { ProviderId } from './constants';

type ProviderMap = Record<
  ProviderId,
  {
    provider?: Provider;
    available?: () => boolean;
    factory: () => Promise<Provider> | Provider;
  }
>;

@Injectable()
export class ProviderService {
  private _currentProvider: ProviderId;
  private providerMap: ProviderMap = {
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
      available: () => !!process.env.LD_KEY,
    },
    cloudbees: {
      factory: async () => {
        const appKey = process.env.CLOUDBEES_APP_KEY;
        if (!appKey) {
          throw new Error('"CLOUDBEES_APP_KEY" must be defined.');
        } else {
          return await CloudbeesProvider.build(appKey);
        }
      },
      available: () => !!process.env.CLOUDBEES_APP_KEY,
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
      available: () => !!process.env.SPLIT_KEY,
    },
    ['go-feature-flag']: {
      factory: () =>
        new GoFeatureFlagProvider({
          endpoint: process.env.GO_FEATURE_FLAG_URL as string,
        }),
      available: () => !!process.env.GO_FEATURE_FLAG_URL,
    },
    flagsmith: {
      factory: () => {
        if (!process.env.FLAGSMITH_ENV_KEY) {
          throw new Error('"FLAGSMITH_ENV_KEY" must be defined.');
        } else {
          const client = new Flagsmith({
            environmentKey: process.env.FLAGSMITH_ENV_KEY as string,
            enableLocalEvaluation: true,
            environmentRefreshIntervalSeconds: 5,
          });
          return new FlagsmithProvider({
            client,
          });
        }
      },
      // getting 401s from flagsmith at the moment.
      available: () => false,
    },
  };

  constructor() {
    this._currentProvider = process.argv[2] as ProviderId;
    this.switchProvider(this._currentProvider as ProviderId);
  }

  get currentProvider() {
    return this._currentProvider;
  }

  async switchProvider(providerId: ProviderId) {
    // get the provider, or run the factory function to make one.
    const provider = this.providerMap[providerId].provider || (await this.providerMap[providerId].factory());
    // cache the provider for later use
    this.providerMap[providerId].provider = provider;

    if (provider) {
      OpenFeature.setProvider(provider);
      this._currentProvider = providerId;
    } else {
      console.warn('No provider set, falling back to no-op');
    }
  }

  getAvailableProviders() {
    return Object.entries(this.providerMap)
      .filter((p) => {
        return p[1].available === undefined || p[1].available();
      })
      .map((p) => p[0]);
  }
}
