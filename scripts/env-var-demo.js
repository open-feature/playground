'use strict';

const { openfeature } = require('../dist/packages/openfeature-js/src');
const {
  OpenFeatureEnvProvider,
} = require('../dist/packages/js-env-provider/src');

/**
 * Registers the environment variable provider to the globally scoped
 * OpenFeature object.
 */
console.log('Registering the OpenFeature environment provider');
openfeature.registerProvider(new OpenFeatureEnvProvider());
