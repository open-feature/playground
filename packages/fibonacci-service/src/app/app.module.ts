import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { LoggerModule } from 'nestjs-pino';
import { LoggingHook, OpenFeatureLogger } from '@openfeature/extra';
import { MetricsHook, SpanEventHook as SpanEventBasedTracingHook } from '@openfeature/open-telemetry-hooks';
import { ProviderService } from '@openfeature/provider';
import { ProvidersController } from './providers.controller';
import { OpenFeatureModule } from '@openfeature/nestjs-sdk';
import type { EvaluationDetails, FlagValue, HookContext } from '@openfeature/server-sdk';

function attributeMapper(_hookContext: HookContext, evaluationDetails: EvaluationDetails<FlagValue>) {
  const flagMetadata = evaluationDetails.flagMetadata ?? {};
  return {
    ...('scope' in flagMetadata && { scope: flagMetadata['scope'] as string | number | boolean }),
  };
}

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
    OpenFeatureModule.forRoot({
      // Set a global logger for OpenFeature. This is logger will available in hooks.
      logger: new OpenFeatureLogger('OpenFeature'),
      //Adding hooks to at the global level will ensure they always run as part of a flag evaluation lifecycle.
      hooks: [
        new LoggingHook(),
        new SpanEventBasedTracingHook({ attributeMapper }),
        new MetricsHook({ attributeMapper }),
      ],
    }),
  ],
  controllers: [AppController, ProvidersController],
  providers: [ProviderService],
})
export class AppModule {}
