'use strict';

const { openfeature } = require('../dist/packages/openfeature-js/src');
const { CloudbeesProvider } = require("../dist/packages/js-cloudbees-provider/src");

/**
 * Registers the environment variable provider to the globally scoped
 * OpenFeature object.
 */
console.log('Registering the OpenFeature environment provider');
openfeature.registerProvider(new CloudbeesProvider('618538bd7ebdeef023b5ff0d'));
