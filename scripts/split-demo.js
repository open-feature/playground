'use strict';

const { openfeature } = require('../dist/packages/openfeature-js/src');
const {
  OpenFeatureSplitAdaptor,
} = require('../dist/packages/js-split-adaptor/src');
const { SplitFactory } = require('@splitsoftware/splitio');

/**
 * Registers the Split client using the OpenFeature Split Adaptor.
 */
console.log('Registering the OpenFeature Split Provider');
openfeature.registerProvider(
  new OpenFeatureSplitAdaptor(
    SplitFactory({
      core: {
        authorizationKey: process.env.SPLIT_KEY ?? '',
      },
    }).client()
  )
);
