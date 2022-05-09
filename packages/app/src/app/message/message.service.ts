import { Inject, Injectable } from '@nestjs/common';
import { Client } from '@openfeature/openfeature-js';
import { OPENFEATURE_CLIENT, REQUEST_DATA } from '../constants';

@Injectable()
export class MessageService {
  constructor(
    @Inject(OPENFEATURE_CLIENT) private client: Client,
    @Inject(REQUEST_DATA) private attributes: any
  ) {}

  async getMessage() {
    const message = (await this.client.getBooleanValue(
      'new-welcome-message',
      false,
      this.attributes
    ))
      ? 'Welcome to Fib3r: Fibonacci as a Service!'
      : 'Welcome to FaaS: Fibonacci as a Service!';
    return { message };
  }
}
