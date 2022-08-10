import { FlagNotFoundError, GeneralError, TypeMismatchError } from '@openfeature/extra';
import { EvaluationContext, Provider, ResolutionDetails } from '@openfeature/openfeature-js';
import axios from 'axios';
import {
  GoFeatureFlagProviderOptions,
  GoFeatureFlagProxyRequest,
  GoFeatureFlagProxyResponse,
  GoFeatureFlagUser,
} from './model';
import { ProxyNotReady } from './proxy-not-ready';

/**
 * NOTE: This is an unofficial provider that was created for demonstration
 * purposes only. The playground environment will be updated to use official
 * providers once they're available.
 */
export class GoFeatureFlagProvider implements Provider {
  metadata = {
    name: 'go-feature-flag',
  };
  private config: GoFeatureFlagProviderOptions;
  private timeout: number;

  constructor(options: GoFeatureFlagProviderOptions) {
    this.config = options;
    this.timeout = options.timeout || 0; // default is 0 = no timeout
  }

  async resolveBooleanEvaluation(
    flagKey: string,
    defaultValue: boolean,
    context: EvaluationContext
  ): Promise<ResolutionDetails<boolean>> {
    return await this.resolveEvaluationGoFeatureFlagProxy<boolean>(
      flagKey,
      defaultValue,
      this.transformContext(context),
      'boolean'
    );
  }

  async resolveStringEvaluation(
    flagKey: string,
    defaultValue: string,
    context: EvaluationContext
  ): Promise<ResolutionDetails<string>> {
    return await this.resolveEvaluationGoFeatureFlagProxy<string>(
      flagKey,
      defaultValue,
      this.transformContext(context),
      'string'
    );
  }

  async resolveNumberEvaluation(
    flagKey: string,
    defaultValue: number,
    context: EvaluationContext
  ): Promise<ResolutionDetails<number>> {
    return await this.resolveEvaluationGoFeatureFlagProxy<number>(
      flagKey,
      defaultValue,
      this.transformContext(context),
      'number'
    );
  }

  async resolveObjectEvaluation<U extends object>(
    flagKey: string,
    defaultValue: U,
    context: EvaluationContext
  ): Promise<ResolutionDetails<U>> {
    return await this.resolveEvaluationGoFeatureFlagProxy<U>(
      flagKey,
      defaultValue,
      this.transformContext(context),
      'object'
    );
  }

  async resolveEvaluationGoFeatureFlagProxy<T>(
    flagKey: string,
    defaultValue: T,
    user: GoFeatureFlagUser,
    expectedType: string
  ): Promise<ResolutionDetails<T>> {
    const request: GoFeatureFlagProxyRequest<T> = {
      user,
      defaultValue,
    };

    // build URL to access to the endpoint
    const endpoint = new URL(this.config.endpoint);
    endpoint.pathname = `v1/feature/${flagKey}/eval`;

    let apiResponseData: GoFeatureFlagProxyResponse<T>;
    try {
      const response = await axios.post<GoFeatureFlagProxyResponse<T>>(endpoint.toString(), request, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        timeout: this.config.timeout,
      });
      apiResponseData = response.data;
    } catch (error) {
      // Impossible to contact the relay-proxy
      if (axios.isAxiosError(error) && (error.code === 'ECONNREFUSED' || error.response?.status === 404)) {
        throw new ProxyNotReady(`impossible to call go-feature-flag relay proxy on ${endpoint}`, error);
      }

      // Timeout when calling the API
      if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
        throw new GeneralError(`impossible to retrieve the ${flagKey} on time: ${error}`);
      }

      // Unknown error
      throw new GeneralError(`unknown error while retrieving flag ${flagKey} for user ${user.key}: ${error}`);
    }

    // Check that we received the expectedType
    if (typeof apiResponseData.value !== expectedType) {
      throw new TypeMismatchError(
        `Flag value ${flagKey} had unexpected type ${typeof apiResponseData.value}, expected ${expectedType}.`
      );
    }

    // If it has failed in the API we return the defaultValue
    if (apiResponseData.failed) {
      throw new FlagNotFoundError(`Flag ${flagKey} was not found in your configuration`);
    }

    return {
      value: apiResponseData.value,
      variant: apiResponseData.variationType,
    };
  }

  private transformContext(context: EvaluationContext): GoFeatureFlagUser {
    {
      // TODO: rework the context transformer
      const { targetingKey, ...attributes } = context;
      return {
        key: targetingKey || (attributes['userId'] as string) || 'anonymous',
        anonymous: !targetingKey,
        custom: attributes,
      };
    }
  }
}
