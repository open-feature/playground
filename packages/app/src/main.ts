/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FlagdProvider } from '@openfeature/flagd-provider';
import { CloudbeesProvider } from '@openfeature/js-cloudbees-provider';
import { OpenFeatureEnvProvider } from '@openfeature/js-env-provider';
// import { FlagsmithV1Provider } from '@openfeature/js-flagsmith-v1-provider';
// import { FlagsmithV2Provider } from '@openfeature/js-flagsmith-v2-provider';
import { GoFeatureFlagProvider } from '@openfeature/go-feature-flag-provider';
// import { JsonProvider } from '@openfeature/js-json-provider';
import { OpenFeatureLaunchDarklyProvider } from '@openfeature/js-launchdarkly-provider';
import { OpenFeatureSplitProvider } from '@openfeature/js-split-provider';
import { OpenFeature, Provider } from '@openfeature/js-sdk';
import { SplitFactory } from '@splitsoftware/splitio';
// import { Flagsmith } from 'flagsmithv2';
// import * as Flagsmith from "flagsmith-nodejs";
import { AppModule } from './app/app.module';
import { ProviderIds } from './app/constants';

const registerProvider = () => {
  const providerId = process.argv[2] as ProviderIds;
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
};

async function bootstrap() {
  registerProvider();
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const port = process.env.PORT || 30000;
  await app.listen(port);
  Logger.log(`🚀 Application is running on: http://localhost:${port}`);
}

bootstrap();
