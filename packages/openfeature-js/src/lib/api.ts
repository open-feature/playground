import { AsyncLocalStorage } from 'async_hooks';
import { OpenFeatureClient } from './client';
import { getGlobal, registerGlobal } from './global';
import { Client, Context, FeatureProvider, FlagValue, HasHooks, Hook } from './types';

export class OpenFeatureAPI implements HasHooks {
  private provider?: FeatureProvider;
  private _hooks: Hook[] = [];
  private asyncLocalStorage = new AsyncLocalStorage();

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

  getClient(name?: string, version?: string, context?: Partial<Context>): Client {
    return new OpenFeatureClient(this, { name, version }, context);
  }

  registerProvider(provider: FeatureProvider): void {
    this.provider = provider;
  }

  getProvider(): FeatureProvider | undefined {
    return this.provider;
  }

  registerHooks(...hooks: Hook<FlagValue>[]): void {
    this._hooks = [...this._hooks, ...hooks];
  }

  getStorage() {
    return this.asyncLocalStorage.getStore();
  }

  runInContext(context: any, callback: ()=> void) {
    return this.asyncLocalStorage.run(context, callback);
  }
}
