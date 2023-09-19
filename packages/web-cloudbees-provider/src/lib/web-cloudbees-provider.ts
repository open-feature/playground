import {
  EvaluationContext,
  JsonValue,
  Logger,
  Provider,
  ProviderEvents,
  ProviderMetadata,
  ResolutionDetails,
  OpenFeatureEventEmitter,
  ProviderStatus,
} from '@openfeature/web-sdk';
import { dynamicApi, RoxFetcherResult, setup } from 'rox-browser';

export interface CloudbeesProviderOptions {
  key: string;
  logger: Logger;
}

/**
 * NOTE: This is an unofficial provider that was created for demonstration
 * purposes only. The playground environment will be updated to use official
 * providers once they're available.
 */
export class CloudbeesWebProvider implements Provider {
  constructor(private options: CloudbeesProviderOptions) {}

  private _status = ProviderStatus.NOT_READY;

  get status() {
    return this._status;
  }

  events = new OpenFeatureEventEmitter();

  metadata: ProviderMetadata = {
    name: 'CloudBees web provider',
  };

  async initialize(context: EvaluationContext): Promise<void> {
    await setup(this.options.key, {
      configurationFetchedHandler: this.changedHandler,
    });
    this._status = ProviderStatus.READY;
  }

  resolveBooleanEvaluation(
    flagKey: string,
    defaultValue: boolean,
    context: EvaluationContext,
    logger: Logger
  ): ResolutionDetails<boolean> {
    return {
      value: dynamicApi.isEnabled(flagKey, defaultValue, context),
    };
  }

  resolveStringEvaluation(
    flagKey: string,
    defaultValue: string,
    context: EvaluationContext,
    logger: Logger
  ): ResolutionDetails<string> {
    return {
      value: dynamicApi.value(flagKey, defaultValue, context),
    };
  }

  resolveNumberEvaluation(
    flagKey: string,
    defaultValue: number,
    context: EvaluationContext,
    logger: Logger
  ): ResolutionDetails<number> {
    return {
      value: dynamicApi.getNumber(flagKey, defaultValue, context),
    };
  }

  resolveObjectEvaluation<T extends JsonValue>(
    flagKey: string,
    defaultValue: T,
    context: EvaluationContext,
    logger: Logger
  ): ResolutionDetails<T> {
    throw new Error('not implemented');
  }

  changedHandler = (fetcherResult: RoxFetcherResult) => {
    if (fetcherResult.hasChanges) {
      // there's changes, dispatch event
      this.events.emit(ProviderEvents.ConfigurationChanged);
    }
  };
}
