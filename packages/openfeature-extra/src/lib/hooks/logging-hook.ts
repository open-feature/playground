import { FlagValue, Hook, HookContext } from '@openfeature/openfeature-js';

/**
 * A hook that simply logs at every life-cycle stage.
 */
export class LoggingHook implements Hook {
  before(hookContext: HookContext) {
    console.log(`Running 'before' logger hook for flag: ${hookContext.flagId}`);
    console.log(JSON.stringify(hookContext.context, undefined, 2))
    return hookContext.context;
  }

  after(hookContext: HookContext, flagValue: FlagValue) {
    console.log(`Running 'after' logger hook for flag: ${hookContext.flagId}`);
    return flagValue;
  }

  finally(hookContext: HookContext) {
    console.log(`Running 'finally' logger hook for flag: ${hookContext.flagId}`);
  }

  error(hookContext: HookContext, err: Error) {
    console.log(`Running 'error' logger hook for flag: ${hookContext.flagId}`);
    console.error(err);
  }
}
