import { Inject, Injectable } from '@nestjs/common';
import { openfeature } from '@openfeature/openfeature-js';
import { fibonacci } from '@openfeature/fibonacci';
import { query, validationResult } from 'express-validator';
import { OpenTelemetryHook, LoggingHook } from '@openfeature/extra';
import { OPENFEATURE, REQUEST_ATTRIBUTES } from './constants';
import { Client } from '@openfeature/openfeature-js';
import { Attributes } from './types';

// TODO: extract into service
// openfeature.registerHooks(new OpenTelemetryHook('app'));
// const client = openfeature.getClient('app');
// client.registerHooks(new LoggingHook());

@Injectable()
export class MessageService {

  constructor(@Inject(OPENFEATURE) private client: Client, @Inject(REQUEST_ATTRIBUTES) private attributes: any) { }

  async getMessage() {
    const message = (await this.client.isEnabled(
      'new-welcome-message',
      false,
      this.attributes
    ))
      ? 'Welcome to the next gen api!'
      : 'Welcome to the api!';
      return { message };
  }
}

