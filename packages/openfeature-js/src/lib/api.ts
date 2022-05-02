import { OpenFeatureClient } from './client';
import { getGlobal, registerGlobal } from './global';
import {
  Client,
  Context,
  FeatureProvider,
  FlagValue,
  FlagEvaluationLifeCycle,
  HasTransactionContext,
  Hook,
  TransactionContext,
} from './types';
import { NoopTransactionContext } from './noop-transaction-context';

export class OpenFeatureAPI
  implements FlagEvaluationLifeCycle, HasTransactionContext
{
  private provider?: FeatureProvider;
  private transactionContext = new NoopTransactionContext();
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

  getClient(name?: string, version?: string, context?: Context): Client {
    return new OpenFeatureClient(this, { name, version }, context);
  }

  registerProvider(provider: FeatureProvider<unknown>): void {
    this.provider = provider;
  }

  getProvider(): FeatureProvider<Context> | FeatureProvider<unknown> {
    if (this.provider) {
      return this.provider;
    } else {
      throw new Error('Provider not set');
    }
  }

  registerHooks(...hooks: Hook<FlagValue>[]): void {
    this._hooks = [...this._hooks, ...hooks];
  }

  registerTransactionContextPropagator(
    transactionContext: TransactionContext
  ): void {
    this.transactionContext = transactionContext;
  }

  getTransactionContext(): Context {
    return this.transactionContext.getTransactionContext();
  }

  setTransactionContext(context: Context, callback: () => void): void {
    this.transactionContext.setTransactionContext(context, callback);
  }
}
