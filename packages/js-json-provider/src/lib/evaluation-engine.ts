import {
  FlagValueType,
  Context,
  ProviderEvaluation,
  FlagNotFoundError,
  TypeMismatchError,
} from '@openfeature/openfeature-js';
import { OpenFeatureFeatureFlags } from './flag';
import { camelCase } from 'change-case';

export class EvaluationEngine {
  constructor() {}

  evaluate<T>(
    flags: OpenFeatureFeatureFlags,
    flagKey: string,
    returnType: FlagValueType,
    context: Context
  ): ProviderEvaluation<T> {
    const flag = flags[camelCase(flagKey)];

    if (!flag || flag.state !== 'enabled') {
      throw new FlagNotFoundError(`${flagKey} not found.`);
    } else if (flag.returnType !== returnType) {
      throw new TypeMismatchError(
        `Flag value ${flagKey} had unexpected type ${flag.returnType}, expected ${returnType}.`
      );
    }

    const matchedRule = (flag.rules ?? []).find((rule) => {
      return rule.conditions.find((condition) => {
        const conditionContextValue = context[condition.context];
        if (condition.op === 'equals') {
          return conditionContextValue === condition.value;
        }
        if (typeof conditionContextValue === 'string') {
          if (condition.op === 'starts_with') {
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
        value: flag.variants![matchedRule.action.variant] as T,
        variant: matchedRule.action.variant,
        reason: 'Rule match',
      };
    }

    return {
      value: flag.variants![flag.defaultVariant!] as T,
      variant: flag.defaultVariant,
      reason: 'Default value',
    };
  }
}
