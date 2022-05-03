import { MiddlewareConsumer, Module, NestModule, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import {
  AsyncLocalStorageTransactionContext,
  LoggingHook,
  OpenTelemetryHook,
} from '@openfeature/extra';
import { openfeature } from '@openfeature/openfeature-js';
import { Request } from 'express';
import { TransactionContextMiddleware } from './transaction-context.middleware';
import { OPENFEATURE_CLIENT, REQUEST_DATA } from './constants';
import { FibonacciAsAServiceController } from './fibonacci-as-a-service.controller';
import { HexColorService } from './hex-color/hex-color.service';
import { InstallService } from './install/install.service';
import { MessageService } from './message/message.service';
import { RequestData } from './types';
import { UtilsController } from './utils.controller';

// register a global hook
openfeature.registerHooks(new LoggingHook(), new OpenTelemetryHook('app'));
openfeature.registerTransactionContextPropagator(
  new AsyncLocalStorageTransactionContext()
);

@Module({
  imports: [],
  controllers: [FibonacciAsAServiceController, UtilsController],
  providers: [
    MessageService,
    InstallService,
    HexColorService,

    {
      provide: OPENFEATURE_CLIENT,
      useFactory: () => {
        const client = openfeature.getClient('app');
        return client;
      },
    },
    {
      provide: REQUEST_DATA,
      useFactory: (req: Request): RequestData => {
        const authHeaderValue = req.header('Authorization') as string;
        return {
          ip:
            (req.headers['x-forwarded-for'] as string) ||
            (req.socket.remoteAddress as string),
          email: authHeaderValue,
          method: req.method,
          path: req.path,
          userId: authHeaderValue,
        };
      },
      scope: Scope.REQUEST,
      inject: [REQUEST],
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TransactionContextMiddleware)
      .forRoutes(FibonacciAsAServiceController);
  }
}
