'use strict';

const { openfeature } = require('../dist/packages/openfeature-js/main');
const { CloudbeesProvider } = require("../dist/packages/js-cloudbees-provider/main");

/**
 * Registers the environment variable provider to the globally scoped
 * OpenFeature object.
 */
console.log('Registering the OpenFeature environment provider');
openfeature.registerProvider(new CloudbeesProvider({ appKey: process.env.CLOUDBEES_APP_KEY }));
