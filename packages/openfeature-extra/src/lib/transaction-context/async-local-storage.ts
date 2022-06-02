import {
  EvaluationContext,
  TransactionContextManager,
} from '@openfeature/openfeature-js';
import { AsyncLocalStorage } from 'async_hooks';

export class AsyncLocalStorageTransactionContext
  implements TransactionContextManager
{
  private asyncLocalStorage = new AsyncLocalStorage<EvaluationContext>();

  getTransactionContext(): EvaluationContext {
    return this.asyncLocalStorage.getStore() ?? {};
  }
  setTransactionContext(
    context: EvaluationContext,
    callback: () => void
  ): void {
    this.asyncLocalStorage.run(context, callback);
  }
}
