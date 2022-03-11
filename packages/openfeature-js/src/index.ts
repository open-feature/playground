import { OpenFeatureAPI } from './lib/api';
export type { OpenFeatureAPI } from './lib/api';
export * from "./lib/types";

export const openfeature = OpenFeatureAPI.getInstance();
