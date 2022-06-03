'use strict';

const { OpenFeature } = require('../dist/packages/openfeature-js/main');
const {
  OpenFeatureLaunchDarklyProvider,
} = require('../dist/packages/js-launchdarkly-provider/main');

/**
 * Registers the LaunchDarkly provider to the globally scoped
 * OpenFeature object.
 */
console.log('Registering the OpenFeature LaunchDarkly provider');
OpenFeature.provider = new OpenFeatureLaunchDarklyProvider({
  sdkKey: process.env.LD_KEY,
});
