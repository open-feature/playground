import { EvaluationDetails, FlagValue, Hook, HookContext, HookHints } from '@openfeature/server-sdk';

/**
 * A hook that simply logs at every life-cycle stage.
 */
export class LoggingHook implements Hook {
  after<T extends FlagValue>(
    hookContext: Readonly<HookContext<T>>,
    evaluationDetails: EvaluationDetails<T>,
    hookHints?: HookHints
  ) {
    const { logger, ...context } = hookContext;
    logger.info(`Flag '${hookContext.flagKey}' evaluated to '${evaluationDetails.value}'`, {
      feature_flag: {
        ...context,
        ...evaluationDetails,
        hookHints: hookHints,
      },
    });
  }

  error(hookContext: HookContext, err: Error) {
    hookContext.logger.error(err);
  }
}
