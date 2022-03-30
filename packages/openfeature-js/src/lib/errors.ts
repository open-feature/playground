export enum ErrorCodes { 
  GeneralError = 'GENERAL_ERROR',
  FlagTypeError = 'FLAG_TYPE_ERROR',
  FlagValueParseError = 'FLAG_VALUE_PARSE_ERROR'   
};;

export abstract class OpenFeatureError extends Error {
  abstract code: ErrorCodes;
}

export class FlagTypeError extends OpenFeatureError {
  code: ErrorCodes;
  constructor(message?: string) {
      super(message);
      Object.setPrototypeOf(this, FlagTypeError.prototype);
      this.code = ErrorCodes.FlagTypeError;
  }
}

export class FlagValueParseError extends OpenFeatureError {
  code: ErrorCodes;
  constructor(message?: string) {
      super(message);
      Object.setPrototypeOf(this, FlagTypeError.prototype);
      this.code = ErrorCodes.FlagValueParseError;
  }
}
