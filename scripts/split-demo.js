'use strict';

const { openfeature } = require('../dist/packages/openfeature-js/src');
const {
  OpenFeatureSplitProvider,
} = require('../dist/packages/js-split-provider/src');
const { SplitFactory } = require('@splitsoftware/splitio');

/**
 * Registers the Split client using the OpenFeature Split Provider.
 */
console.log('Registering the OpenFeature Split Provider');
openfeature.registerProvider(
  new OpenFeatureSplitProvider(
    SplitFactory({
      core: {
        authorizationKey: process.env.SPLIT_KEY ?? '',
      },
    }).client()
  )
);
