import { Module, Scope, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { PassportModule } from '@nestjs/passport';
import { AppController } from './api.controller';
import { MessageService } from './message.service';
import { BasicStrategy } from './basic.strategy';
import { OPENFEATURE, REQUEST_ATTRIBUTES } from './constants';
import { FibonacciService } from './fibonacci.service';
import { UserService } from './user.service';
import { openfeature } from '@openfeature/openfeature-js';
import { OpenTelemetryHook, LoggingHook } from '@openfeature/extra';
import { Attributes, User } from './types';
import { AttributeMiddleware } from './attribute.middleware';

// registery a global hook
openfeature.registerHooks(new LoggingHook(), new OpenTelemetryHook('app'));

@Module({
  imports: [PassportModule],
  controllers: [AppController],
  providers: [
    BasicStrategy,
    MessageService,
    FibonacciService,
    BasicStrategy,
    UserService,
    {
      provide: OPENFEATURE,
      useFactory: () => {
        const client = openfeature.getClient('app');
        return client;
      }
    },
    {
      provide: REQUEST_ATTRIBUTES,
      useFactory: (req: Request, userService: UserService): Attributes => {
        return {
          ip: req.headers['x-forwarded-for'] as string || req.socket.remoteAddress as string,
          method: req.method,
          path: req.path,
          userId: (userService.user as User)?.username
        }
      },
      scope: Scope.REQUEST,
      inject: [REQUEST, UserService]
    }
  ]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AttributeMiddleware).forRoutes(AppController)
  }
}
