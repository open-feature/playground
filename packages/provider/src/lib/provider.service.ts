import { Injectable, Logger } from '@nestjs/common';
import { FlagdProvider } from '@openfeature/flagd-provider';
import { GoFeatureFlagProvider } from '@openfeature/go-feature-flag-provider';
import { EnvVarProvider } from '@openfeature/env-var-provider';
import { FlagsmithProvider } from '@openfeature/js-flagsmith-provider';
import { OpenFeatureLaunchDarklyProvider } from '@openfeature/js-launchdarkly-provider';
import { OpenFeature, Provider } from '@openfeature/server-sdk';
import { OpenFeatureSplitProvider } from '@openfeature/js-split-provider';
import { SplitFactory } from '@splitsoftware/splitio';
import { CloudbeesProvider } from 'cloudbees-openfeature-provider-node';
import Flagsmith from 'flagsmith-nodejs';
import { Client } from '@harnessio/ff-nodejs-server-sdk';
import { OpenFeatureHarnessProvider } from '@openfeature/js-harness-provider';
import { OpenFeatureLogger } from '@openfeature/extra';
import {
  AvailableProvider,
  CB_PROVIDER_ID,
  CONFIGCAT_PROVIDER_ID,
  ENV_PROVIDER_ID,
  FLAGD_OFREP_PROVIDER_ID,
  FLAGD_PROVIDER_ID,
  FLAGSMITH_PROVIDER_ID,
  FLIPT_PROVIDER_ID,
  GO_OFREP_PROVIDER_ID,
  GO_PROVIDER_ID,
  HARNESS_PROVIDER_ID,
  ProviderId,
  SPLIT_PROVIDER_ID,
} from '@openfeature/utils';
import { OFREPProvider } from '@openfeature/ofrep-provider';
import { FliptProvider } from '@openfeature/flipt-provider';
import { ConfigCatProvider } from '@openfeature/config-cat-provider';
import { PollingMode } from '@configcat/sdk';

type ProviderMap = Record<
  ProviderId,
  {
    provider?: Provider;
    available?: () => boolean;
    factory: () => Promise<Provider> | Provider;
  } & Omit<AvailableProvider, 'id'>
>;

@Injectable()
export class ProviderService {
  private readonly logger = new Logger(ProviderService.name);
  private _currentProvider: ProviderId;
  private providerMap: ProviderMap = {
    [ENV_PROVIDER_ID]: { factory: () => new EnvVarProvider() },
    [FLAGD_PROVIDER_ID]: {
      factory: () => new FlagdProvider(),
      host: process.env.FLAGD_HOST_WEB ?? 'localhost',
      port: Number.parseInt(process.env.FLAGD_PORT_WEB || '8013') || 8013,
      tls: process.env.FLAGD_TLS_WEB === 'true',
    },
    [FLAGD_OFREP_PROVIDER_ID]: {
      factory: () => {
        const host = process.env.FLAGD_HOST ?? 'localhost';
        const port = Number.parseInt(process.env.FLAGD_OFREP_PORT || '8016') || 8016;
        const tls = process.env.FLAGD_OFREP_TLS === 'true';
        const baseUrl = `${tls ? 'https' : 'http'}://${host}:${port}`;
        return new OFREPProvider({ baseUrl });
      },
      host: process.env.FLAGD_HOST_WEB ?? 'localhost',
      port: Number.parseInt(process.env.FLAGD_OFREP_PORT_WEB || '8016') || 8016,
      tls: process.env.FLAGD_TLS_WEB === 'true',
    },
    launchdarkly: {
      factory: () => {
        const sdkKey = process.env.LD_KEY;
        if (!sdkKey) {
          throw new Error('"LD_KEY" must be defined.');
        } else {
          return new OpenFeatureLaunchDarklyProvider({
            sdkKey,
            logger: new OpenFeatureLogger(`LaunchDarkly Provider`),
          });
        }
      },
      available: () => !!process.env.LD_KEY && !!process.env.LD_KEY_WEB,
      webCredential: process.env.LD_KEY_WEB,
    },
    [CB_PROVIDER_ID]: {
      factory: async () => {
        const appKey = process.env.CLOUDBEES_APP_KEY;
        if (!appKey) {
          throw new Error('"CLOUDBEES_APP_KEY" must be defined.');
        } else {
          /* eslint-disable  @typescript-eslint/no-explicit-any */
          return CloudbeesProvider.build(appKey) as any;
        }
      },
      available: () => !!process.env.CLOUDBEES_APP_KEY && !!process.env.CLOUDBEES_APP_KEY_WEB,
      webCredential: process.env.CLOUDBEES_APP_KEY_WEB,
    },
    [SPLIT_PROVIDER_ID]: {
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
            logger: new OpenFeatureLogger(`Split Provider`),
          });
        }
      },
      available: () => !!process.env.SPLIT_KEY && !!process.env.SPLIT_KEY_WEB,
      webCredential: process.env.SPLIT_KEY_WEB,
    },
    [GO_PROVIDER_ID]: {
      factory: () =>
        new GoFeatureFlagProvider({
          endpoint: process.env.GO_FEATURE_FLAG_URL as string,
        }),
      available: () => !!process.env.GO_FEATURE_FLAG_URL,
      url: process.env.GO_FEATURE_FLAG_WEB_URL as string,
    },
    [GO_OFREP_PROVIDER_ID]: {
      factory: () => {
        return new OFREPProvider({ baseUrl: process.env.GO_FEATURE_FLAG_URL as string });
      },
      available: () => !!process.env.GO_FEATURE_FLAG_URL,
      url: process.env.GO_FEATURE_FLAG_WEB_URL as string,
    },
    [FLAGSMITH_PROVIDER_ID]: {
      factory: () => {
        if (!process.env.FLAGSMITH_ENV_KEY) {
          throw new Error('"FLAGSMITH_ENV_KEY" must be defined.');
        } else {
          const client = new Flagsmith({
            environmentKey: process.env.FLAGSMITH_ENV_KEY as string,
            enableLocalEvaluation: true,
            /**
             * Overriding the default API URL because it was returning a 502.
             */
            apiUrl: 'https://api.flagsmith.com/api/v1/',
            /**
             * Refresh aggressively for demo purposes.
             * The Default value in Flagsmith is 60 seconds.
             */
            environmentRefreshIntervalSeconds: 5,
          });
          return new FlagsmithProvider({
            client,
            logger: new OpenFeatureLogger(`Flagsmith Provider`),
          });
        }
      },
      available: () => !!process.env.FLAGSMITH_ENV_KEY && !!process.env.FLAGSMITH_ENV_KEY_WEB,
      webCredential: process.env.FLAGSMITH_ENV_KEY_WEB,
    },
    [HARNESS_PROVIDER_ID]: {
      factory: () => {
        if (!process.env.HARNESS_KEY) {
          throw new Error('"HARNESS_KEY" must be defined.');
        } else {
          const client = new Client(process.env.HARNESS_KEY);
          return new OpenFeatureHarnessProvider(client);
        }
      },
      available: () => !!process.env.HARNESS_KEY && !!process.env.HARNESS_KEY_WEB,
      webCredential: process.env.HARNESS_KEY_WEB,
    },
    [FLIPT_PROVIDER_ID]: {
      factory: () => {
        return new FliptProvider('default', { url: process.env.FLIPT_URL as string });
      },
      available: () => !!process.env.FLIPT_URL,
      url: process.env.FLIPT_WEB_URL,
    },
    [CONFIGCAT_PROVIDER_ID]: {
      factory: () => {
        const sdkKey = process.env.CONFIGCAT_SDK_KEY;
        if (!sdkKey) {
          throw new Error('"CONFIGCAT_SDK_KEY" must be defined.');
        } else {
          return ConfigCatProvider.create(sdkKey, PollingMode.AutoPoll, { pollIntervalSeconds: 5 });
        }
      },
      available: () => !!process.env.CONFIGCAT_SDK_KEY && !!process.env.CONFIGCAT_SDK_KEY_WEB,
      webCredential: process.env.CONFIGCAT_SDK_KEY_WEB,
    },
  };

  constructor() {
    const configuredDefaultProvider = process.argv[2] as ProviderId;
    if (this.providerMap[configuredDefaultProvider]) {
      this._currentProvider = process.argv[2] as ProviderId;
    } else {
      this.logger.warn("Using FlagD because the default provider hasn't been defined.");
      this._currentProvider = 'flagd';
    }

    this.switchProvider(this._currentProvider);
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

  getAvailableProviders(): AvailableProvider[] {
    return Object.entries(this.providerMap)
      .filter((p) => {
        return p[1].available === undefined || p[1].available();
      })
      .map((p) => {
        return {
          id: p[0] as ProviderId,
          webCredential: p[1].webCredential,
          host: p[1].host,
          port: p[1].port,
          tls: p[1].tls,
          url: p[1].url,
        };
      });
  }
}
