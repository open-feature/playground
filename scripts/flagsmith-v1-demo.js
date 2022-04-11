'use strict';

const { openfeature } = require('../dist/packages/openfeature-js/main');
const {
  FlagsmithV1Provider,
} = require('../dist/packages/js-flagsmith-v1-provider/main');

/**
 * Registers the flagsmith-v1 provider to the globally scoped
 * OpenFeature object.
 */
console.log('Registering the OpenFeature flagsmith-v1 provider');
openfeature.registerProvider(new FlagsmithV1Provider({ environmentID: process.env.FLAGSMITH_ENV_ID }));
