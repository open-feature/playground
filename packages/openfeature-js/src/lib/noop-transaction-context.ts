import { EvaluationContext } from '@openfeature/js-sdk';

export class NoopTransactionContext {
  getTransactionContext(): EvaluationContext {
    return {};
  }

  setTransactionContext(_: EvaluationContext, callback: () => void): void {
    callback();
  }
}
