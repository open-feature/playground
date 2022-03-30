import { Span, trace, Tracer } from '@opentelemetry/api';
import { OpenFeatureAPI } from './api';
import { NOOP_FEATURE_PROVIDER } from './noop-provider';
import { SpanProperties } from './span-properties';
import {
  Context, FeatureProvider, Features, FlagType
} from './types';

type OpenFeatureClientOptions = {
  name?: string;
  version?: string;
};

export class OpenFeatureClient implements Features {
  private _name: string | undefined;
  private _version?: string;

  private _trace: Tracer;

  constructor(
    private readonly api: OpenFeatureAPI,
    options: OpenFeatureClientOptions
  ) {
    this._name = options.name;
    this._version = options.version;
    this._trace = trace.getTracer(OpenFeatureClient.name);
  }

  isEnabled(flagId: string, defaultValue: boolean, context?: Context): Promise<boolean> {
    return this.getBooleanValue(flagId, defaultValue, context);
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
    id: string,
    defaultValue: T,
    context?: Context
  ): Promise<T> {
    const span = this.startSpan(`feature flag - ${type}`);
    try {
      span.setAttribute(SpanProperties.FEATURE_FLAG_ID, id);

      const provider = this.getProvider();
      let valuePromise: boolean | string | number | object;
      switch(type) {
        case 'boolean': {
          valuePromise = provider.getBooleanValue(id, defaultValue as boolean, context);
          break;
        }
        case 'string': {
          valuePromise = provider.getStringValue(id, defaultValue as string, context);
          break;
        }
        case 'number': {
          valuePromise = provider.getNumberValue(id, defaultValue as number, context);
          break;
        }
        case 'json': {
          valuePromise = provider.getObjectValue(id, defaultValue as object, context);
          break;
        }
      }

      const value = await valuePromise;
      span.setAttribute(SpanProperties.FEATURE_FLAG_VALUE, value.toString());
      return value as T;
    } catch (err) {
      console.error(err);
      span.setAttribute(SpanProperties.FEATURE_FLAG_VALUE, defaultValue.toString());
      return defaultValue;
    } finally {
      span.end();
    }
  }

  private startSpan(spanName: string): Span {
    return this._trace.startSpan(spanName, {
      attributes: {
        [SpanProperties.FEATURE_FLAG_CLIENT_NAME]: this._name,
        [SpanProperties.FEATURE_FLAG_CLIENT_VERSION]:
          this._version ?? 'unknown',
        [SpanProperties.FEATURE_FLAG_SERVICE]: this.getProvider().name,
      },
    });
  }

  private getProvider(): FeatureProvider {
    return this.api.getProvider() ?? NOOP_FEATURE_PROVIDER;
  }
}
