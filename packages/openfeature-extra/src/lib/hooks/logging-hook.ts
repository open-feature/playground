import { Hook, HookContext } from '@openfeature/js-sdk';

/**
 * A hook that simply logs at every life-cycle stage.
 */
export class LoggingHook implements Hook {
  name = 'logging';

  error(hookContext: HookContext, err: Error) {
    console.log(`Running 'error' logger hook for flag: ${hookContext.flagKey}`);
    console.error(err);
  }
}
