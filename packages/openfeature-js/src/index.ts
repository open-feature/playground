import { OpenFeatureAPI } from './lib/api';
export type { OpenFeatureAPI } from './lib/api';
export * from './lib/types';
export * from './lib/errors';
export * from './lib/utils';

export const openfeature = OpenFeatureAPI.getInstance();
