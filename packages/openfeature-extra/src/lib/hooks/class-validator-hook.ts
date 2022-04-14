import { FlagValue, Hook, HookContext } from '@openfeature/openfeature-js';
import { validateSync } from 'class-validator';

type Class = { new (data: any): any };

/**
 * A hook that instantiates the given class based on the flag value, and validates it using 'class-validator'.
 */
export class ClassValidatorHook implements Hook {
  constructor(private clazz: Class) {}

  after(_: HookContext, flagValue: FlagValue) {
    const instance = new this.clazz(flagValue);
    const result = validateSync(instance);
    if (result.length) {
      throw Error(`Invalid payload, result: ${result}`);
    }
    return instance;
  }
}
