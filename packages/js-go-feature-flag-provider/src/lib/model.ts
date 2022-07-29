import { JSONValue } from '@openfeature/nodejs-sdk';
import { ProviderOptions } from '@openfeature/openfeature-js';

export interface GoFeatureFlagUser {
  key: string;
  anonymous?: boolean;
  custom?: {
    [key: string]: JSONValue;
  };
}

export interface GoFeatureFlagProxyRequest<T> {
  user: GoFeatureFlagUser;
  defaultValue: T;
}

export interface GoFeatureFlagProxyResponse<T> {
  failed: boolean;
  trackEvents: boolean;
  value: T;
  variationType: string;
  version?: string;
}

export interface GoFeatureFlagProviderOptions extends ProviderOptions<GoFeatureFlagUser> {
  endpoint: string;
  timeout?: number; // in millisecond
}
