'use strict';

const { OpenFeature } = require('../dist/packages/openfeature-js/main');
const {
  GoFeatureFlagProvider,
  GoFeatureFlagProviderOptions,
} = require('../dist/packages/js-go-feature-flag-provider/main');

/**
 * Registers the go-feature-flag provider to the globally scoped
 * OpenFeature object.
 */
console.log('Registering the OpenFeature go-feature-flag provider');
OpenFeature.provider = new GoFeatureFlagProvider(
  {
    endpoint: "http://localhost:1031"
  }
);
