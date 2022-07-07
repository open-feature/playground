import { ErrorCode } from '@openfeature/extra';

export class ProxyNotReady extends Error {
  code: ErrorCode;
  constructor(message: string, originalError: Error) {
    super(`${message}: ${originalError}`)
    Object.setPrototypeOf(this, ProxyNotReady.prototype);
    this.code = ErrorCode.PROVIDER_NOT_READY;
  }
}
