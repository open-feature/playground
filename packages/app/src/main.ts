/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  NonTransformingProvider,
  OpenFeature,
  Provider,
  TransformingProvider,
} from '@openfeature/nodejs-sdk';
import { CloudbeesProvider } from '@openfeature/js-cloudbees-provider';
import { OpenFeatureEnvProvider } from '@openfeature/js-env-provider';
import { FlagsmithV1Provider } from '@openfeature/js-flagsmith-v1-provider';
import { FlagsmithV2Provider } from '@openfeature/js-flagsmith-v2-provider';
import { JsonProvider } from '@openfeature/js-json-provider';
import { OpenFeatureLaunchDarklyProvider } from '@openfeature/js-launchdarkly-provider';
import { OpenFeatureSplitProvider } from '@openfeature/js-split-provider';
import { AppModule } from './app/app.module';
import { SplitFactory } from '@splitsoftware/splitio';
import { Flagsmith } from 'flagsmithv2';
import { FlagdProvider } from '@openfeature/flagd-provider';
import { GoFeatureFlagProvider } from '@openfeature/js-go-feature-flag-provider';

const handlerDemo = () => {
  const client = OpenFeature.getClient();
  client.addHandler('new-welcome-message', async (key) => {
    console.log(
      `Got update for ${key}, new value is ${await client.getBooleanValue(
        key,
        false
      )}`
    );
  });

  client.addHandler('hex-color', async (key) => {
    console.log(
      `Got update for ${key}, new value is ${await client.getStringValue(
        key,
        '000000'
      )}`
    );
  });
};

const registerProvider = () => {
  const providerId = process.argv[2];
  let provider:
    | NonTransformingProvider
    | TransformingProvider<unknown>
    | undefined = undefined;

  switch (providerId) {
    case 'env':
      provider = new OpenFeatureEnvProvider();
      break;

    case 'json':
      provider = new JsonProvider();
      break;

    case 'flagd':
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

    case 'flagsmithv1': {
      const environmentID = process.env.FLAGSMITH_ENV_ID;
      if (!environmentID) {
        console.error('"FLAGSMITH_ENV_ID" must be defined.');
      } else {
        provider = new FlagsmithV1Provider({
          environmentID,
        });
      }
      break;
    }

    case 'flagsmithv2': {
      const environmentKey = process.env.FLAGSMITH_ENV_KEY;
      if (!environmentKey) {
        console.error('"FLAGSMITH_ENV_KEY" must be defined.');
      } else {
        const client = new Flagsmith({
          environmentKey,
          enableLocalEvaluation: true,
          environmentRefreshIntervalSeconds: 5,
        });
        provider = new FlagsmithV2Provider({
          client,
        });
      }
      break;
    }

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
  handlerDemo();
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const port = process.env.PORT || 30000;
  await app.listen(port);
  Logger.log(`🚀 Application is running on: http://localhost:${port}`);
}

bootstrap();
