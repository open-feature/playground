import {
  FlagValueType,
  Context,
  ProviderEvaluation,
  FlagNotFoundError,
  TypeMismatchError,
} from '@openfeature/openfeature-js';
import { Flags } from './types';

export class EvaluationEngine {
  constructor(private readonly flags: Flags) {}

  evaluate<T>(
    flagKey: string,
    returnType: FlagValueType,
    context: Context
  ): ProviderEvaluation<T> {
    const flag = this.flags[flagKey];

    if (!flag || flag.state !== 'enabled') {
      throw new FlagNotFoundError(`${flagKey} not found.`);
    } else if (flag.returnType !== returnType) {
      throw new TypeMismatchError(
        `Flag value ${flagKey} had unexpected type ${flag.returnType}, expected ${returnType}.`
      );
    }

    const matchedRule = flag.rules.find((rule) => {
      return rule.conditions.find((condition) => {
        const conditionContextValue = context[condition.context];
        if (typeof conditionContextValue === 'string') {
          if (condition.op === 'equals') {
            return conditionContextValue === condition.value;
          } else if (condition.op === 'starts_with') {
            return conditionContextValue.startsWith(condition.value);
          } else if (condition.op === 'ends_with') {
            return conditionContextValue.endsWith(condition.value);
          }
        }
        return false;
      });
    });

    if (matchedRule) {
      return {
        // TODO fix typing
        value: flag.variants[matchedRule.target.variant] as unknown as T,
        variant: matchedRule.target.variant,
        // TODO give a better reason
        reason: 'Rule match',
      };
    }

    return {
      value: flag.variants[flag.defaultVariant] as unknown as T,
      variant: flag.defaultVariant,
      reason: 'Default value',
    };
  }
}
