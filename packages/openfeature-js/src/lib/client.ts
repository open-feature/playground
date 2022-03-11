import { OpenFeatureAPI } from './api';
import {
  FeatureProvider,
  Context,
  FlagEvaluationVariationResponse,
  Feature,
} from './types';
import { NOOP_FEATURE_PROVIDER } from './noop-provider';
import { Span, trace, Tracer } from '@opentelemetry/api';
import { SpanProperties } from './span-properties';

type OpenFeatureClientOptions = {
  name: string;
  version?: string;
};

export class OpenFeatureClient implements Feature {
  private _name: string;
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

  // TODO: see if a default callback makes sense here
  async isEnabled(id: string, context?: Context): Promise<boolean> {
    return (await this.evaluateFlag('is_enabled', id, context)).enabled;
  }

  async getVariation(
    id: string,
    context?: Context
  ): Promise<FlagEvaluationVariationResponse> {
    return this.evaluateFlag('variation', id, context);
  }

  private async evaluateFlag(
    type: 'is_enabled' | 'variation',
    id: string,
    context?: Context
  ) {
    const span = this.startSpan(`feature flag - ${type}`);
    try {
      span.setAttribute(SpanProperties.FEATURE_FLAG_ID, id);

      const response = await this.getProvider().evaluateFlag({
        flagId: id,
        context: context ?? {},
        clientName: this._name,
        clientVersion: this._version,
      });

      span.setAttribute(SpanProperties.FEATURE_FLAG_ENABLED, response.enabled);

      if (response.stringValue) {
        span.setAttribute(
          SpanProperties.FEATURE_FLAG_VARIATION_STRING,
          response.stringValue
        );
      }

      return response;
    } catch (err) {
      console.error(err);
      const enabled = false;
      span.setAttribute(SpanProperties.FEATURE_FLAG_ENABLED, enabled);
      return { enabled };
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
