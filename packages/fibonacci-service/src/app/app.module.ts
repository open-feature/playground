import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {LoggerModule} from 'nestjs-pino';
import {FlagMetadata} from '@openfeature/server-sdk';
import {LoggingHook, OpenFeatureLogger} from '@openfeature/extra';
import {MetricsHook, TracingHook as SpanEventBasedTracingHook} from '@openfeature/open-telemetry-hooks';
import {ProviderService} from '@openfeature/provider';
import {ProvidersController} from './providers.controller';
import {OpenFeatureModule} from "@openfeature/nestjs-sdk";

function attributeMapper(flagMetadata: FlagMetadata) {
  return {
    ...('scope' in flagMetadata && {scope: flagMetadata.scope}),
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
      hooks: [new LoggingHook(), new SpanEventBasedTracingHook({attributeMapper}), new MetricsHook({attributeMapper})],
    })
  ],
  controllers: [AppController, ProvidersController],
  providers: [ProviderService],
})
export class AppModule {}
