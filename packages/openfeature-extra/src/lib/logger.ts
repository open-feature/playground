import { Logger as OFLogger } from '@openfeature/nestjs-sdk';
import { Logger } from '@nestjs/common';

/**
 * Extend the NestJS logger to be compliant with the OpenFeature logger.
 */
export class OpenFeatureLogger extends Logger implements OFLogger {
  info(...args: unknown[]): void {
    const [msg, ...context] = args;
    this.log(msg, context);
  }
}
