'use strict';

const { openfeature } = require('../dist/packages/openfeature-js/main');
const {
  OpenFeatureSplitProvider,
} = require('../dist/packages/js-split-provider/main');
const { SplitFactory } = require('@splitsoftware/splitio');

/**
 * Registers the Split client using the OpenFeature Split Provider.
 */
console.log('Registering the OpenFeature Split Provider');
openfeature.registerProvider(
  new OpenFeatureSplitProvider({
    splitClient: SplitFactory({
      core: {
        authorizationKey: process.env.SPLIT_KEY ?? '',
      },
    }).client()
  })
);
