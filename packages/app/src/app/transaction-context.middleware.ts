import { Injectable, NestMiddleware, Inject } from '@nestjs/common';
import { openfeature } from '@openfeature/openfeature-js';
import { NextFunction, Request, Response } from 'express';
import { REQUEST_DATA } from './constants';
import { RequestData } from './types';

@Injectable()
export class TransactionContextMiddleware implements NestMiddleware {
  constructor(@Inject(REQUEST_DATA) private requestData: RequestData) {}

  /**
   * Adds our request data to the OpenFeature context via the configured TransactionContextManager
   */
  use(_req: Request, _res: Response, next: NextFunction) {
    openfeature.setTransactionContext(
      { ts: new Date().getTime(), ...this.requestData },
      () => {
        next();
      }
    );
  }
}
