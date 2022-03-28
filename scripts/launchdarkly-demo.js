'use strict';

const { openfeature } = require('../dist/packages/openfeature-js/src');
const {
  OpenFeatureLaunchDarklyProvider,
} = require('../dist/packages/js-launchdarkly-provider/src');

/**
 * Registers the LaunchDarkly provider to the globally scoped
 * OpenFeature object.
 */
console.log('Registering the OpenFeature LaunchDarkly provider');
openfeature.registerProvider(
  new OpenFeatureLaunchDarklyProvider(process.env.LD_KEY)
);
