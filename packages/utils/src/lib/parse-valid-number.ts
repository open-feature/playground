import { ParseError, TypeMismatchError } from '@openfeature/js-sdk';

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
