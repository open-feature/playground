import { Injectable, NestMiddleware } from '@nestjs/common';
import { EvaluationContext, OpenFeature } from '@openfeature/js-sdk';
import { NextFunction, Request, Response } from 'express';
import { propagation, context } from '@opentelemetry/api';

@Injectable()
export class TransactionContextMiddleware implements NestMiddleware {
  /**
   * Adds our request data to the OpenFeature context via the configured TransactionContextManager
   */
  use(_req: Request, _res: Response, next: NextFunction) {
    const baggage = propagation.getBaggage(context.active());
    const currentBaggage = baggage?.getAllEntries();
    const evaluationContext: EvaluationContext = {};

    currentBaggage?.forEach(([key, value]) => {
      evaluationContext[key] = value.value;
    });

    OpenFeature.setTransactionContext(evaluationContext, next);
  }
}
