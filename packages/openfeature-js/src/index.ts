import { OpenFeature as OpenFeatureBase, EvaluationContext } from '@openfeature/js-sdk';

export {
  EvaluationContext,
  Provider,
  ResolutionDetails,
  Client,
  EvaluationDetails,
  Hook,
  HookContext,
  FlagValue,
  JsonValue,
} from '@openfeature/js-sdk';

export interface TransactionContextManager {
  getTransactionContext(): EvaluationContext;
  setTransactionContext(evaluationContext: EvaluationContext, callback: () => void): void;
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

interface ContextPropagationExtras {
  setTransactionContextPropagator: (manager: TransactionContextManager) => void;
  getTransactionContext: () => EvaluationContext;
  setTransactionContext: (evaluationContext: EvaluationContext, callback: () => void) => void;
}

const casted = OpenFeatureBase as any;

// add context propagation
casted._transactionContext = new NoopTransactionContext();
casted.setTransactionContextPropagator = function (manager: TransactionContextManager) {
  (OpenFeatureBase as any)._transactionContext = manager;
};
casted.getTransactionContext = function () {
  return (OpenFeatureBase as any)._transactionContext.getTransactionContext();
};
casted.setTransactionContext = function (evaluationContext: EvaluationContext, callback: () => void): void {
  casted._transactionContext.setTransactionContext(evaluationContext, callback);
};

export type OpenFeatureWithExtensions = typeof OpenFeatureBase & ContextPropagationExtras;
const OpenFeature = OpenFeatureBase as OpenFeatureWithExtensions;
Object.setPrototypeOf(OpenFeature, Object.getPrototypeOf(OpenFeatureBase));

export { OpenFeature };
