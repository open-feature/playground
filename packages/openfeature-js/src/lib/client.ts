import { OpenFeatureAPI } from './api';
import { NOOP_FEATURE_PROVIDER } from './noop-provider';
import {
  Client,
  Context, FeatureProvider, Features, FlagType, Hook
} from './types';

type OpenFeatureClientOptions = {
  name?: string;
  version?: string;
};

export class OpenFeatureClient extends Client {
  private name: string | undefined;
  private version?: string;

  constructor(
    private readonly api: OpenFeatureAPI,
    options: OpenFeatureClientOptions
  ) {
    super();
    this.name = options.name;
    this.version = options.version;
  }

  isEnabled(flagId: string, defaultValue: boolean, context?: Context): Promise<boolean> {
    return this.evaluateFlag('enabled', flagId, defaultValue, context);
  }

  getBooleanValue(flagId: string, defaultValue: boolean, context?: Context): Promise<boolean> {
    return this.evaluateFlag('boolean', flagId, defaultValue, context);
  }

  getStringValue(flagId: string, defaultValue: string, context?: Context): Promise<string> {
    return this.evaluateFlag('string', flagId, defaultValue, context);
  }

  getNumberValue(flagId: string, defaultValue: number, context?: Context): Promise<number> {
    return this.evaluateFlag('number', flagId, defaultValue, context);
  }

  getObjectValue<T extends object>(flagId: string, defaultValue: T, context?: Context): Promise<T> {
    return this.evaluateFlag('json', flagId, defaultValue, context);
  }

  private async evaluateFlag<T extends boolean | string | number | object>(
    type: FlagType,
    flagId: string,
    defaultValue: T,
    context: Context = {}
  ): Promise<T> {
    
    try {
      const mergedContext = this.hooks.reduce((accumulated: Context, hook: Hook): Context => {
        if (typeof hook?.before === 'function') {
          return { ...accumulated, ...hook.before(accumulated, flagId) };
        }
        return accumulated;
      }, context);

      const provider = this.getProvider();
      let valuePromise: boolean | string | number | object;
      switch(type) {
        case 'enabled': {
          valuePromise = provider.isEnabled(flagId, defaultValue as boolean, context);
          break;
        }
        case 'boolean': {
          valuePromise = provider.getBooleanValue(flagId, defaultValue as boolean, context);
          break;
        }
        case 'string': {
          valuePromise = provider.getStringValue(flagId, defaultValue as string, context);
          break;
        }
        case 'number': {
          valuePromise = provider.getNumberValue(flagId, defaultValue as number, context);
          break;
        }
        case 'json': {
          valuePromise = provider.getObjectValue(flagId, defaultValue as object, context);
          break;
        }
      }

      const value = await valuePromise;

      const updatedValue = this.hooks.reduce((accumulated: unknown, hook) => {
        if (typeof hook?.after === 'function') {
          return hook.after(mergedContext, flagId, value);
        }        
      }, value);

      this.hooks.forEach((hook) => {
        if (typeof hook?.always === 'function') {
          return hook.always(mergedContext, flagId, value);
        }  
      })

      return updatedValue as T;
    } catch (err) {
      console.error(err);
      return defaultValue;
    }
  }

  // private startSpan(spanName: string): Span {
  //   return this._trace.startSpan(spanName, {
  //     attributes: {
  //       [SpanProperties.FEATURE_FLAG_CLIENT_NAME]: this.name,
  //       [SpanProperties.FEATURE_FLAG_CLIENT_VERSION]:
  //         this.version ?? 'unknown',
  //       [SpanProperties.FEATURE_FLAG_SERVICE]: this.getProvider().name,
  //     },
  //   });
  // }

  private getProvider(): FeatureProvider {
    return this.api.getProvider() ?? NOOP_FEATURE_PROVIDER;
  }
}
