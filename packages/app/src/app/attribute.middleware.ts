import { Injectable, NestMiddleware, Inject } from '@nestjs/common';
import { openfeature } from '@openfeature/openfeature-js';
import { NextFunction, Request, Response } from 'express';
import { REQUEST_DATA } from './constants';

@Injectable()
export class TransactionContextMiddleware implements NestMiddleware {
  constructor(@Inject(REQUEST_DATA) private attributes: any) {}

  use(_req: Request, _res: Response, next: NextFunction) {
    openfeature.setTransactionContext(
      { ts: new Date().getTime(), ...this.attributes },
      () => {
        next();
      }
    );
  }
}
