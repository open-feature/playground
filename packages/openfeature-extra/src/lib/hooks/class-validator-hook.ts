import { EvaluationDetails, Hook, HookContext, JsonObject } from '@openfeature/js-sdk';
import { validateSync } from 'class-validator';

/* eslint-disable  @typescript-eslint/no-explicit-any */
type Class = { new (data: any): any };

/**
 * A hook that instantiates the given class based on the flag value, and validates it using 'class-validator'.
 */
export class ClassValidatorHook implements Hook {
  constructor(private clazz: Class) {}
  name = 'validator';

  after(_: Readonly<HookContext>, details: EvaluationDetails<JsonObject>) {
    const instance = new this.clazz(details.value);
    const result = validateSync(instance);
    if (result.length) {
      throw Error(`Invalid payload, result: ${result}`);
    }
    return instance;
  }
}
