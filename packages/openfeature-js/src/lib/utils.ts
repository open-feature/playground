import { ParseError, TypeMismatchError } from './errors';

export const parseValidNumber = (stringValue: string | undefined) => {
  if (stringValue === undefined) {
    throw new ParseError(`Invalid 'undefined' value.`);
  }
  const result = Number.parseFloat(stringValue);
  if (Number.isNaN(result)) {
    throw new TypeMismatchError(`Invalid numeric value ${stringValue}`);
  }
  return result;
};

export const parseValidBoolean = (stringValue: string | undefined) => {
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
      throw new TypeMismatchError(`Invalid boolean value for ${asUnknown}`);
  }
};

export const parseValidJsonObject = <T extends object>(
  stringValue: string | undefined
): T => {
  if (stringValue === undefined) {
    throw new ParseError(`Invalid 'undefined' JSON value.`);
  }
  // we may want to allow the parsing to be customized.
  try {
    const value = JSON.parse(stringValue);
    if (typeof value === 'object') {
      throw new TypeMismatchError(
        `Flag value ${stringValue} had unexpected type ${typeof value}, expected "object"`
      );
    }
    return value;
  } catch (err) {
    throw new ParseError(`Error parsing ${stringValue} as JSON`);
  }
};
