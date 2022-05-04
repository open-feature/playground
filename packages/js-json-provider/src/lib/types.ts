import { FlagValue, FlagValueType } from '@openfeature/openfeature-js';

export type Flags = {
  [flagKey: string]: {
    name?: string;
    description?: string;
    returnType: FlagValueType;
    variants: {
      [variant: string]: FlagValue;
    };
    defaultVariant: string;
    state: 'enabled' | 'disabled';
    rules: Array<{
      target: {
        variant: string;
      };
      conditions: Array<{
        context: string;
        op: 'equals' | 'starts_with' | 'ends_with';
        value: string;
      }>;
    }>;
  };
};
