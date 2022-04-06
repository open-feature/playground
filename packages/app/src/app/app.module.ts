import { MiddlewareConsumer, Module, NestModule, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { PassportModule } from '@nestjs/passport';
import {
  AsyncLocalStorageTransactionContext,
  LoggingHook,
  OpenTelemetryHook,
} from '@openfeature/extra';
import { openfeature } from '@openfeature/openfeature-js';
import { Request } from 'express';
import { AppController } from './api.controller';
import { TransactionContextMiddleware } from './attribute.middleware';
import { BasicStrategy } from './basic.strategy';
import { OPENFEATURE_CLIENT, REQUEST_DATA } from './constants';
import { HelloService } from './hello/hello.service';
import { InstallService } from './install/install.service';
import { MessageService } from './message/message.service';
import { Attributes, User } from './types';
import { UserService } from './user.service';

// register a global hook
openfeature.registerHooks(new LoggingHook(), new OpenTelemetryHook('app'));
openfeature.registerTransactionContextPropagator(
  new AsyncLocalStorageTransactionContext()
);

@Module({
  imports: [PassportModule],
  controllers: [AppController],
  providers: [
    BasicStrategy,
    MessageService,
    BasicStrategy,
    UserService,
    InstallService,
    HelloService,
    {
      provide: OPENFEATURE_CLIENT,
      useFactory: () => {
        const client = openfeature.getClient('app');
        return client;
      },
    },
    {
      provide: REQUEST_DATA,
      useFactory: (req: Request, userService: UserService): Attributes => {
        return {
          ip:
            (req.headers['x-forwarded-for'] as string) ||
            (req.socket.remoteAddress as string),

          method: req.method,
          path: req.path,
          userId: (userService.user as User)?.username,
          platform: (
            (req.header('Sec-CH-UA-Platform') as string) || 'Windows'
          ).replace(/"/g, ''),
        };
      },
      scope: Scope.REQUEST,
      inject: [REQUEST, UserService],
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TransactionContextMiddleware).forRoutes(AppController);
  }
}
