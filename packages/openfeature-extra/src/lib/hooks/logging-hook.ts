import { Hook, HookContext } from '@openfeature/openfeature-js';

export class LoggingHook implements Hook {
  before(hookContext: HookContext) {
    console.log(`Running before hook on ${hookContext.flagId}`);
  }

  after(hookContext: HookContext, flagValue: unknown) {
    console.log(`Running after hook on ${hookContext.flagId}`);
  }

  // finally(hookContext: HookContext, flagValue: unknown) {
  //   hookContext.context._span?.end();
  //   return flagValue;
  // }

  error(hookContext: HookContext, err: Error) {
    console.error(err);
  }
}
