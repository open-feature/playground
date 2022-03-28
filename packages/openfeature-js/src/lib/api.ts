import { OpenFeatureClient } from './client';
import { getGlobal, registerGlobal } from './global';
import { Features, FeatureProvider } from './types';

export class OpenFeatureAPI {
  private provider?: FeatureProvider;

  public static getInstance(): OpenFeatureAPI {
    const globalApi = getGlobal();
    if (globalApi) {
      return globalApi;
    }

    const instance = new OpenFeatureAPI();
    registerGlobal(instance);
    return instance;
  }

  public getClient(name?: string, version?: string): Features {
    return new OpenFeatureClient(this, { name, version });
  }

  public registerProvider(provider: FeatureProvider): void {
    this.provider = provider;
  }

  public getProvider(): FeatureProvider | undefined {
    return this.provider;
  }
}
