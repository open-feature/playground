'use strict';

const { OpenFeature } = require('../dist/packages/openfeature-js/main');
const { JsonProvider } = require('../dist/packages/js-json-provider/main');

/**
 * Registers the json provider to the globally scoped
 * OpenFeature object.
 */
console.log('Registering the OpenFeature json provider');
OpenFeature.provider = new JsonProvider();
