import { ErrorCode } from './codes';
import { OpenFeatureError } from './error.abstract';

export class TypeMismatchError extends OpenFeatureError {
  code: ErrorCode;
  constructor(message?: string) {
    super(message);
    Object.setPrototypeOf(this, TypeMismatchError.prototype);
    this.code = ErrorCode.TYPE_MISMATCH;
  }
}
