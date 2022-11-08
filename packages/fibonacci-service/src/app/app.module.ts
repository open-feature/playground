import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { LoggerModule } from 'nestjs-pino';

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
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
