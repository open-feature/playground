import { Hook, HookContext } from '@openfeature/openfeature-js';

export class LoggingHook implements Hook {
  before(hookContext: HookContext) {
    console.log(`Running before hook on ${hookContext.flagId}`);
    return hookContext.context;
  }

  after(hookContext: HookContext, flagValue: string | number | boolean | object) {
    console.log(`Running after hook on ${hookContext.flagId}`);
    return flagValue;
  }

  error(hookContext: HookContext, err: Error) {
    console.error(err);
  }
}
