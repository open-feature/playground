import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { AppController } from './app.controller';
import { LoggerModule } from 'nestjs-pino';
import { FlagMetadata, OpenFeature } from '@openfeature/js-sdk';
import { AsyncLocalStorageTransactionContext, LoggingHook, OpenFeatureLogger } from '@openfeature/extra';
import { TracingHook as SpanEventBasedTracingHook, MetricsHook } from '@openfeature/open-telemetry-hooks';
import { OpenTelemetryHook as SpanBasedTracingHook } from '@openfeature/open-telemetry-hook';
import { TransactionContextMiddleware } from './transaction-context.middleware';
import { ProviderService } from '@openfeature/provider';
import { ProvidersController } from './providers.controller';

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
  ],
  controllers: [AppController, ProvidersController],
  providers: [ProviderService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TransactionContextMiddleware).forRoutes(AppController);
  }
}
