import { Injectable, NestMiddleware } from '@nestjs/common';
import { openfeature } from '@openfeature/openfeature-js';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class AttributeMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    openfeature.runInContext({ ts: new Date().getTime() }, () => {
      next();
    });
  }
}
