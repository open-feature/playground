import { ErrorCode } from './codes';
import { OpenFeatureError } from './error.abstract';

export class ParseError extends OpenFeatureError {
  code: ErrorCode;
  constructor(message?: string) {
    super(message);
    Object.setPrototypeOf(this, ParseError.prototype);
    this.code = ErrorCode.PARSE_ERROR;
  }
}
