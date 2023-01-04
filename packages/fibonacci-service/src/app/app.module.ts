import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { AppController } from './app.controller';
import { LoggerModule } from 'nestjs-pino';
import { OpenFeature } from '@openfeature/js-sdk';
import { AsyncLocalStorageTransactionContext, LoggingHook, OpenFeatureLogger } from '@openfeature/extra';
import { OpenTelemetryHook } from '@openfeature/open-telemetry-hook';
import { TransactionContextMiddleware } from './transaction-context.middleware';
import { FlagdProvider } from '@openfeature/flagd-provider';

// TODO pull from shared config
OpenFeature.setProvider(new FlagdProvider());

/**
 * Set a global logger for OpenFeature. This is logger will available in hooks.
 */

OpenFeature.setLogger(new OpenFeatureLogger('OpenFeature'));

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
                target: 'pino-http-print',
              }
            : undefined,
      },
    }),
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TransactionContextMiddleware).forRoutes(AppController);
  }
}
