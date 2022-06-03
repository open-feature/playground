import { ErrorCode } from './codes';
import { OpenFeatureError } from './error.abstract';

export class GeneralError extends OpenFeatureError {
  code: ErrorCode;
  constructor(message?: string) {
    super(message);
    Object.setPrototypeOf(this, GeneralError.prototype);
    this.code = ErrorCode.GENERAL;
  }
}
