import { TypeMismatchError } from '@openfeature/core';

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
