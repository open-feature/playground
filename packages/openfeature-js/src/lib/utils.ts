import { FlagTypeError, FlagValueParseError } from './errors';
import { Context, ContextTransformer } from './types';

export const parseValidNumber = (stringValue: string) => {
  const result = Number.parseFloat(stringValue);
  if (Number.isNaN(result)) {
    throw new FlagTypeError(`Invalid numeric value ${stringValue}`);
  }
  return result;
};

export const parseValidBoolean = (stringValue: string) => {
  const asUnknown = stringValue as unknown;

  switch (asUnknown) {
    case 'true': 
      return true;
    case 'false':
      return false;
    case true: 
      return true;
    case false:
      return false;
    default:
      throw new FlagTypeError(`Invalid boolean value for ${asUnknown}`)
  }
};

export const parseValidJsonObject = <T extends object>(stringValue: string): T => {
  // we may want to allow the parsing to be customized.
  try {
    const value = JSON.parse(stringValue);
    if (typeof value === 'object') {
      throw new FlagTypeError(`Flag value ${stringValue} had unexpected type ${typeof value}, expected "object"`);
    }
    return value;
  } catch (err) {
    throw new FlagValueParseError(`Error parsing ${stringValue} as JSON`);
  }
}

export const noopContextTransformer: ContextTransformer = (context: Context) => context;
