import { OpenFeatureClient } from './client';
import { getGlobal, registerGlobal } from './global';
import {
  Client,
  FeatureProvider,
  FlagValue,
  FlagEvaluationLifeCycle,
  Hook,
} from './types';

export class OpenFeatureAPI implements FlagEvaluationLifeCycle {
  private provider?: FeatureProvider;
  private _hooks: Hook[] = [];

  static getInstance(): OpenFeatureAPI {
    const globalApi = getGlobal();
    if (globalApi) {
      return globalApi;
    }

    const instance = new OpenFeatureAPI();
    registerGlobal(instance);
    return instance;
  }

  get hooks() {
    return this._hooks;
  }

  getClient(name?: string, version?: string): Client {
    return new OpenFeatureClient(this, { name, version });
  }

  registerProvider(provider: FeatureProvider): void {
    this.provider = provider;
  }

  getProvider(): FeatureProvider | undefined {
    return this.provider;
  }

  registerHooks(...hooks: Hook<FlagValue>[]): void {
    this._hooks = hooks;
  }
}
