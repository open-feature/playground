import { OpenFeatureAPI } from './api';

/**
 * A string is used here instead of a symbols only for demo purposes. In this
 * situation, it wasn't possible to use a symbol because provider registration
 * code was using a relative import while the rest of the code was doing an
 * aliased import. This meant the require cache couldn't be used and multiple symbols
 * were registered.
 */
// export const GLOBAL_OPENFEATURE_API_KEY = Symbol('openfeature.js.api');
export const GLOBAL_OPENFEATURE_API_KEY = 'openfeature.js.api';

const _global = global as OpenFeatureGlobal;

export function registerGlobal(openFeatureApi: OpenFeatureAPI) {
  _global[GLOBAL_OPENFEATURE_API_KEY] = openFeatureApi;
}

export function getGlobal(): OpenFeatureAPI | undefined {
  return _global[GLOBAL_OPENFEATURE_API_KEY];
}

export function unregisterGlobal() {
  delete _global[GLOBAL_OPENFEATURE_API_KEY];
}

type OpenFeatureGlobal = {
  [GLOBAL_OPENFEATURE_API_KEY]?: OpenFeatureAPI;
};
