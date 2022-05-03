import { Context, TransactionContextManager } from './types';

export class NoopTransactionContext implements TransactionContextManager {
  getTransactionContext(): Context {
    return {};
  }

  setTransactionContext(_: Context, callback: () => void): void {
    callback();
  }
}
