import {
  OpenFeature as OpenFeatureBase,
  EvaluationContext,
} from '@openfeature/nodejs-sdk';

export {
  EvaluationContext,
  Provider,
  ResolutionDetails,
  ProviderOptions,
  ContextTransformer,
  Client,
  EvaluationDetails,
  Hook,
  HookContext,
  FlagValue,
} from '@openfeature/nodejs-sdk';

export interface TransactionContextManager {
  getTransactionContext(): EvaluationContext;
  setTransactionContext(
    evaluationContext: EvaluationContext,
    callback: () => void
  ): void;
}

/**
 * Transaction context hasn't been defined in the spec yet.
 *
 * https://github.com/open-feature/spec/issues/81
 */
class NoopTransactionContext {
  getTransactionContext(): EvaluationContext {
    return {};
  }

  setTransactionContext(_: EvaluationContext, callback: () => void): void {
    callback();
  }
}

export class OpenFeature extends OpenFeatureBase {
  private static _transactionContext = new NoopTransactionContext();

  static set transactionContextPropagator(
    transactionContext: TransactionContextManager
  ) {
    OpenFeature._transactionContext = transactionContext;
  }

  static getTransactionContext(): EvaluationContext {
    return OpenFeature._transactionContext.getTransactionContext();
  }

  static setTransactionContext(
    evaluationContext: EvaluationContext,
    callback: () => void
  ): void {
    OpenFeature._transactionContext.setTransactionContext(
      evaluationContext,
      callback
    );
  }
}
