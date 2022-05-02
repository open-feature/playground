import { Context, TransactionContext } from './types';

export class NoopTransactionContext implements TransactionContext {
  getTransactionContext(): Context {
    return {};
  }

  setTransactionContext(_: Context, callback: () => void): void {
    callback();
  }
}
