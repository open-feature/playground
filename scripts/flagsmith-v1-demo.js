'use strict';

const { OpenFeature } = require('../dist/packages/openfeature-js/main');
const {
  FlagsmithV1Provider,
} = require('../dist/packages/js-flagsmith-v1-provider/main');

/**
 * Registers the flagsmith-v1 provider to the globally scoped
 * OpenFeature object.
 */
console.log('Registering the OpenFeature flagsmith-v1 provider');
OpenFeature.provider = new FlagsmithV1Provider({
  environmentID: process.env.FLAGSMITH_ENV_ID,
});
