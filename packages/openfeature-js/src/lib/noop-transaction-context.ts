import { EvaluationContext } from '@openfeature/nodejs-sdk';

export class NoopTransactionContext {
  getTransactionContext(): EvaluationContext {
    return {};
  }

  setTransactionContext(_: EvaluationContext, callback: () => void): void {
    callback();
  }
}
