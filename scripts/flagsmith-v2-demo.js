'use strict';

const { openfeature } = require('../dist/packages/openfeature-js/main');
const Flagsmith = require('flagsmithv2').default;
const {
  FlagsmithV2Provider,
} = require('../dist/packages/js-flagsmith-v2-provider/main');

/**
 * Registers the flagsmith-v2 provider to the globally scoped
 * OpenFeature object.
 */
console.log('Registering the OpenFeature flagsmith-v2 provider');
openfeature.registerProvider(new FlagsmithV2Provider({
  client: new Flagsmith({
    environmentKey: process.env.FLAGSMITH_ENV_KEY,
    enableLocalEvaluation: true,
    environmentRefreshIntervalSeconds: 5
  })
}));
