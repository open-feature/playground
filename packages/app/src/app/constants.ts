export const OPENFEATURE_CLIENT = Symbol.for('OPENFEATURE_CLIENT');
export const REQUEST_DATA = Symbol.for('REQUEST_DATA');

export const EXAMPLE_JSON_FILE = 'flags.example.json';
export const JSON_FILE = 'flags.json';

export const ENV_PROVIDER_ID = 'env';
export const FLAGD_PROVIDER_ID = 'flagd';
export const GO_PROVIDER_ID = 'go';
export const LD_PROVIDER_ID = 'launchdarkly';
export const SPLIT_PROVIDER_ID = 'split';
export const CB_PROVIDER_ID = 'cloudbees';
export const FLAGSMITH_PROVIDER_ID = 'flagsmith';

export type ProviderId = typeof ENV_PROVIDER_ID
  | typeof FLAGD_PROVIDER_ID
  | typeof GO_PROVIDER_ID
  | typeof LD_PROVIDER_ID
  | typeof SPLIT_PROVIDER_ID
  | typeof CB_PROVIDER_ID
  | typeof FLAGSMITH_PROVIDER_ID;