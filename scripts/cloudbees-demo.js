'use strict';

const { OpenFeature } = require('../dist/packages/openfeature-js/main');
const {
  CloudbeesProvider,
} = require('../dist/packages/js-cloudbees-provider/main');

/**
 * Registers the environment variable provider to the globally scoped
 * OpenFeature object.
 */
console.log('Registering the OpenFeature environment provider');
OpenFeature.provider = new CloudbeesProvider({
  appKey: process.env.CLOUDBEES_APP_KEY,
});
