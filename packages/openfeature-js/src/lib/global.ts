import { OpenFeatureAPI } from './api';

export const GLOBAL_OPENFEATURE_API_KEY = Symbol.for('openfeature.js.api');

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
