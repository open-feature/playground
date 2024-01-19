import {HttpModule} from '@nestjs/axios';
import {ExecutionContext, Module} from '@nestjs/common';
import {ServeStaticModule} from '@nestjs/serve-static';
import {LoggingHook, OpenFeatureLogger} from '@openfeature/extra';
import {FlagMetadata} from '@openfeature/js-sdk';
import {TracingHook as SpanEventBasedTracingHook, MetricsHook} from '@openfeature/open-telemetry-hooks';
import {ProviderService} from '@openfeature/provider';
import {Request} from 'express';
import {Agent} from 'http';
import {LoggerModule} from 'nestjs-pino';
import {join} from 'path';
import {FibonacciAsAServiceController} from './fibonacci-as-a-service.controller';
import {FibonacciService} from './fibonacci/fibonacci.service';
import {ProvidersController} from './providers.controller';
import {UtilsController} from './utils.controller';
import {EvaluationContext, OpenFeatureModule} from "@openfeature/nestjs-sdk";

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
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'ui'),
    }),
    HttpModule.register({
      httpAgent: new Agent({keepAlive: true}),
    }),
    OpenFeatureModule.forRoot({
      // Set a global logger for OpenFeature. This is logger will available in hooks.
      logger: new OpenFeatureLogger('OpenFeature'),
      //Adding hooks to at the global level will ensure they always run as part of a flag evaluation lifecycle.
      hooks: [new LoggingHook(), new SpanEventBasedTracingHook({attributeMapper}), new MetricsHook({attributeMapper})],
      // This context will be used for all flag evaluations in the callstack
      contextFactory: async (context: ExecutionContext): Promise<EvaluationContext> => {
        const req = await context.switchToHttp().getRequest<Request>()
        const authHeaderValue = req.header('Authorization') || 'anonymous';
        const userAgent = req.header('user-agent');
        return {
          ts: new Date().getTime(),
          ip: (req.headers['x-forwarded-for'] as string) || (req.socket.remoteAddress as string),
          email: authHeaderValue,
          method: req.method,
          path: req.path,
          ...(userAgent && {userAgent}),
          targetingKey: authHeaderValue,
        };
      },
    })
  ],
  controllers: [FibonacciAsAServiceController, UtilsController, ProvidersController],
  providers: [
    FibonacciService,
    ProviderService,
  ],
})
export class AppModule {
}
