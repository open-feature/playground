'use strict';

const { openfeature } = require('../dist/packages/openfeature-js/main');
const {
  OpenFeatureLaunchDarklyProvider,
} = require('../dist/packages/js-launchdarkly-provider/main');

/**
 * Registers the LaunchDarkly provider to the globally scoped
 * OpenFeature object.
 */
console.log('Registering the OpenFeature LaunchDarkly provider');
openfeature.registerProvider(
  new OpenFeatureLaunchDarklyProvider({ sdkKey: process.env.LD_KEY })
);
