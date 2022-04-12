import { ErrorCode } from './types';
export abstract class OpenFeatureError extends Error {
  abstract code: ErrorCode;
}

export class GeneralError extends OpenFeatureError {
  code: ErrorCode;
  constructor(message?: string) {
    super(message);
    Object.setPrototypeOf(this, TypeMismatchError.prototype);
    this.code = ErrorCode.GENERAL;
  }
}

export class TypeMismatchError extends OpenFeatureError {
  code: ErrorCode;
  constructor(message?: string) {
    super(message);
    Object.setPrototypeOf(this, TypeMismatchError.prototype);
    this.code = ErrorCode.TYPE_MISMATCH;
  }
}

export class FlagNotFoundError extends OpenFeatureError {
  code: ErrorCode;
  constructor(message?: string) {
    super(message);
    Object.setPrototypeOf(this, FlagNotFoundError.prototype);
    this.code = ErrorCode.FLAG_NOT_FOUND;
  }
}

export class ParseError extends OpenFeatureError {
  code: ErrorCode;
  constructor(message?: string) {
    super(message);
    Object.setPrototypeOf(this, TypeMismatchError.prototype);
    this.code = ErrorCode.PARSE_ERROR;
  }
}
