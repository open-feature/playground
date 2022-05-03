import {
  Context,
  TransactionContextManager,
} from '@openfeature/openfeature-js';
import { AsyncLocalStorage } from 'async_hooks';

export class AsyncLocalStorageTransactionContext
  implements TransactionContextManager
{
  private asyncLocalStorage = new AsyncLocalStorage<Context>();

  getTransactionContext(): Context {
    return this.asyncLocalStorage.getStore() ?? {};
  }
  setTransactionContext(context: Context, callback: () => void): void {
    this.asyncLocalStorage.run(context, callback);
  }
}
