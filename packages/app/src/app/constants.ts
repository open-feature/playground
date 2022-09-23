export const OPENFEATURE_CLIENT = Symbol.for('OPENFEATURE_CLIENT');
export const REQUEST_DATA = Symbol.for('REQUEST_DATA');

export const EXAMPLE_JSON_FILE = 'flags.example.json';
export const JSON_FILE = 'flags.json';

export const FLAGD_PROVIDER_ID = 'flagd';
export const ENV_PROVIDER_ID = 'env';
export const GO_PROVIDER_ID = 'go';
// provider credentials
export const SaasProvidersEnvMap = {
  cloudbees: 'CLOUDBEES_APP_KEY',
  launchdarkly: 'LD_KEY',
  split: 'SPLIT_KEY'
};

export type ProviderIds = keyof typeof SaasProvidersEnvMap
  | typeof FLAGD_PROVIDER_ID
  | typeof ENV_PROVIDER_ID
  | typeof GO_PROVIDER_ID
