export const ENV_PROVIDER_ID = 'env';
export const FLAGD_PROVIDER_ID = 'flagd';
export const GO_PROVIDER_ID = 'go-feature-flag';
export const LD_PROVIDER_ID = 'launchdarkly';
export const SPLIT_PROVIDER_ID = 'split';
export const CB_PROVIDER_ID = 'cloudbees';
export const FLAGSMITH_PROVIDER_ID = 'flagsmith';
export const HARNESS_PROVIDER_ID = 'harness';

export type ProviderId =
  | typeof ENV_PROVIDER_ID
  | typeof FLAGD_PROVIDER_ID
  | typeof GO_PROVIDER_ID
  | typeof LD_PROVIDER_ID
  | typeof SPLIT_PROVIDER_ID
  | typeof CB_PROVIDER_ID
  | typeof FLAGSMITH_PROVIDER_ID
  | typeof HARNESS_PROVIDER_ID;
