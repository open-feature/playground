import { HttpModule } from '@nestjs/axios';
import { MiddlewareConsumer, Module, NestModule, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { AsyncLocalStorageTransactionContext, LoggingHook, OpenFeatureLogger } from '@openfeature/extra';
import { FlagMetadata, OpenFeature } from '@openfeature/js-sdk';
import { TracingHook as SpanEventBasedTracingHook, MetricsHook } from '@openfeature/open-telemetry-hooks';
import { OpenTelemetryHook as SpanBasedTracingHook } from '@openfeature/open-telemetry-hook';
import { ProviderService } from '@openfeature/provider';
import { Request } from 'express';
import { Agent } from 'http';
import { LoggerModule } from 'nestjs-pino';
import { join } from 'path';
import { OPENFEATURE_CLIENT, REQUEST_DATA } from './constants';
import { FibonacciAsAServiceController } from './fibonacci-as-a-service.controller';
import { FibonacciService } from './fibonacci/fibonacci.service';
import { ProvidersController } from './providers.controller';
import { TransactionContextMiddleware } from './transaction-context.middleware';
import { RequestData } from './types';
import { UtilsController } from './utils.controller';

/**
 * Set a global logger for OpenFeature. This is logger will available in hooks.
 */
OpenFeature.setLogger(new OpenFeatureLogger('OpenFeature'));

function attributeMapper(flagMetadata: FlagMetadata) {
  return {
    ...('scope' in flagMetadata && { scope: flagMetadata.scope }),
  };
}

const traceHook =
  process.env.ENABLED_SPAN_BASED_TRACES === 'true'
    ? new SpanBasedTracingHook()
    : new SpanEventBasedTracingHook({ attributeMapper });

/**
 * Adding hooks to at the global level will ensure they always run
 * as part of a flag evaluation lifecycle.
 */
OpenFeature.addHooks(new LoggingHook(), traceHook, new MetricsHook({ attributeMapper }));

/**
 * The transaction context propagator is an experimental feature
 * that allows evaluation context to be set anywhere in a request
 * and have it automatically available during a flag evaluation.
 */
OpenFeature.setTransactionContextPropagator(new AsyncLocalStorageTransactionContext());

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        /**
         * Pretty print logs when in a non-prod context.
         *
         * Note: NX uses webpack behind the scenes which replaces NODE_ENV at
         * build time. The environment defaults to development unless the `--prod`
         * flag is used provided in the build command.
         */
        transport:
          process.env['NODE' + '_ENV'] !== 'production'
            ? {
                target: 'pino-pretty',
                options: {
                  hideObject: true,
                },
              }
            : undefined,
      },
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'ui'),
    }),
    HttpModule.register({
      httpAgent: new Agent({ keepAlive: true }),
    }),
  ],
  controllers: [FibonacciAsAServiceController, UtilsController, ProvidersController],
  providers: [
    FibonacciService,
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
        const userAgent = req.header('user-agent');
        return {
          ip: (req.headers['x-forwarded-for'] as string) || (req.socket.remoteAddress as string),
          email: authHeaderValue,
          method: req.method,
          path: req.path,
          ...(userAgent && { userAgent }),
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
