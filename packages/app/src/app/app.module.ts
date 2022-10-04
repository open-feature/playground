import { MiddlewareConsumer, Module, NestModule, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { AsyncLocalStorageTransactionContext, LoggingHook } from '@openfeature/extra';
import { OpenTelemetryHook } from '@openfeature/open-telemetry-hook';
import { OpenFeature } from '@openfeature/js-sdk';
import { Request } from 'express';
import { TransactionContextMiddleware } from './transaction-context.middleware';
import { OPENFEATURE_CLIENT, REQUEST_DATA } from './constants';
import { FibonacciAsAServiceController } from './fibonacci-as-a-service.controller';
import { HexColorService } from './hex-color/hex-color.service';
import { MessageService } from './message/message.service';
import { RequestData } from './types';
import { UtilsController } from './utils.controller';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ProvidersController } from './providers.controller';
import { ProviderService } from './provider.service';

/**
 * Adding hooks to at the global level will ensure they always run
 * as part of a flag evaluation lifecycle.
 */
OpenFeature.addHooks(new LoggingHook(), new OpenTelemetryHook());

/**
 * The transaction context propagator is an experimental feature
 * that allows evaluation context to be set anywhere in a request
 * and have it automatically available during a flag evaluation.
 */
OpenFeature.setTransactionContextPropagator(new AsyncLocalStorageTransactionContext());

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '.', 'assets', 'public'),
    }),
  ],
  controllers: [FibonacciAsAServiceController, UtilsController, ProvidersController],
  providers: [
    MessageService,
    HexColorService,
    ProviderService,
    {
      provide: OPENFEATURE_CLIENT,
      useFactory: () => {
        const client = OpenFeature.getClient('app');
        return client;
      },
    },
    {
      provide: REQUEST_DATA,
      useFactory: (req: Request): RequestData => {
        const authHeaderValue = req.header('Authorization') || 'anonymous';
        return {
          ip: (req.headers['x-forwarded-for'] as string) || (req.socket.remoteAddress as string),
          email: authHeaderValue,
          method: req.method,
          path: req.path,
          targetingKey: authHeaderValue,
        };
      },
      scope: Scope.REQUEST,
      inject: [REQUEST],
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TransactionContextMiddleware).forRoutes(FibonacciAsAServiceController);
  }
}
