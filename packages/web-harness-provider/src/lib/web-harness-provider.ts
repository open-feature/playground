import { Event as HarnessEvent, initialize } from '@harnessio/ff-javascript-client-sdk';
import {
  EvaluationContext,
  OpenFeatureEventEmitter,
  JsonValue,
  Logger,
  Provider,
  ProviderEvents,
  ProviderMetadata,
  ResolutionDetails,
  TypeMismatchError,
  ProviderStatus,
} from '@openfeature/web-sdk';

type ValueTypes = 'boolean' | 'string' | 'number' | 'object'; 

/**
 * NOTE: This is an unofficial provider that was created for demonstration
 * purposes only. The playground environment will be updated to use official
 * providers once they're available.
 */
export class HarnessWebProvider implements Provider {
  private _client!: ReturnType<typeof initialize>;

  metadata: ProviderMetadata = {
    name: 'Harness web provider',
  };

  private _status = ProviderStatus.NOT_READY;

  get status() {
    return this._status;
  }

  events = new OpenFeatureEventEmitter();

  constructor(private apiKey: string, private logger?: Logger) {}

  initialize(context: EvaluationContext): Promise<void> {
    this._client = initialize(this.apiKey, { identifier: context.targetingKey || 'anon', attributes: context });

    return new Promise((resolve) => {
      this._client.on(HarnessEvent.READY, () => {
        // mark as ready as soon as the SDK setup completes
        this.addChangeHandler(this._client);
        this._status = ProviderStatus.READY;
        resolve();
      });
    });
  }

  onContextChange?(oldContext: EvaluationContext, newContext: EvaluationContext): Promise<void> {
    const oldClient = this._client;
    const client = initialize(this.apiKey, { identifier: newContext.targetingKey || 'anon', attributes: newContext });
    // needed?
    return new Promise((resolve, reject) => {
      client.on(HarnessEvent.READY, () => {
        oldClient.close();
        this.addChangeHandler(client);
        this._client = client;
        resolve();
      });
    });
  }

  onClose?(): Promise<void> {
    return Promise.resolve(this._client.close());
  }

  resolveBooleanEvaluation(
    flagKey: string,
    defaultValue: boolean,
    context: EvaluationContext,
    logger: Logger
  ): ResolutionDetails<boolean> {
    return this.resolve(flagKey, defaultValue, 'boolean');
  }

  resolveStringEvaluation(
    flagKey: string,
    defaultValue: string,
    context: EvaluationContext,
    logger: Logger
  ): ResolutionDetails<string> {
    return this.resolve(flagKey, defaultValue, 'string');
  }

  resolveNumberEvaluation(
    flagKey: string,
    defaultValue: number,
    context: EvaluationContext,
    logger: Logger
  ): ResolutionDetails<number> {
    return this.resolve(flagKey, defaultValue, 'number');
  }

  resolveObjectEvaluation<T extends JsonValue>(
    flagKey: string,
    defaultValue: T,
    context: EvaluationContext,
    logger: Logger
  ): ResolutionDetails<T> {
    return this.resolve(flagKey, defaultValue, 'object');
  }

  resolve<T>(flagKey: string, defaultValue: T, type: ValueTypes): ResolutionDetails<T> {
    // harness doesn't seem to allow '-' in flag keys
    const transformedKey = flagKey.replace(/-/g, '');
    const value = this._client.variation(transformedKey, defaultValue);
    if (typeof value === type) {
      return {
        value,
      } as ResolutionDetails<T>;
    } else {
      throw new TypeMismatchError();
    }
  }

  addChangeHandler(client: ReturnType<typeof initialize>) {
    client.on(HarnessEvent.CHANGED, () => {
      this.events.emit(ProviderEvents.ConfigurationChanged);
    });
  }
}
