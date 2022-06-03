'use strict';

const { OpenFeature } = require('../dist/packages/openfeature-js/main');
const {
  OpenFeatureEnvProvider,
} = require('../dist/packages/js-env-provider/main');

/**
 * Registers the environment variable provider to the globally scoped
 * OpenFeature object.
 */
console.log('Registering the OpenFeature environment provider');
OpenFeature.provider = new OpenFeatureEnvProvider();
