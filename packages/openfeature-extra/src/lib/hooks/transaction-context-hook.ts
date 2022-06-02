import { Hook, HookContext, OpenFeature } from '@openfeature/openfeature-js';

export class TransactionContextHook implements Hook {
  name = 'TransactionContext';

  before(hookContext: HookContext) {
    const transactionContext = OpenFeature.getTransactionContext();
    return {
      ...hookContext.context,
      ...transactionContext,
    };
  }
}
