import { Context, FeatureProvider } from './types';

class NoopFeatureProvider implements FeatureProvider {

  constructor() {
    console.warn(`No provider configured. Falling back to ${this.name}.`);
  }

  readonly name = 'No-op Provider';

  isEnabled(id: string, defaultValue: boolean, context?: Context): Promise<boolean> {
    return Promise.resolve(defaultValue);
  }
  getBooleanValue(flagId: string, defaultValue: boolean, context?: Context): Promise<boolean> {
    return Promise.resolve(defaultValue);
  }
  getStringValue(flagId: string, defaultValue: string, context?: Context): Promise<string> {
    return Promise.resolve(defaultValue);
  }
  getNumberValue(flagId: string, defaultValue: number, context?: Context): Promise<number> {
    return Promise.resolve(defaultValue);
  }
  getObjectValue<T extends object>(flagId: string, defaultValue: T, context?: Context): Promise<T> {
    return Promise.resolve(defaultValue);
  }
}

export const NOOP_FEATURE_PROVIDER = new NoopFeatureProvider();
