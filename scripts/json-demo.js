'use strict';

const { openfeature } = require('../dist/packages/openfeature-js/main');
const { JsonProvider } = require('../dist/packages/js-json-provider/main');

/**
 * Registers the json provider to the globally scoped
 * OpenFeature object.
 */
console.log('Registering the OpenFeature json provider');
openfeature.registerProvider(new JsonProvider());
