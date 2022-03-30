'use strict';

const { openfeature } = require('../dist/packages/openfeature-js/main');
const {
  OpenFeatureEnvProvider,
} = require('../dist/packages/js-env-provider/main');

/**
 * Registers the environment variable provider to the globally scoped
 * OpenFeature object.
 */
console.log('Registering the OpenFeature environment provider');
openfeature.registerProvider(new OpenFeatureEnvProvider());
