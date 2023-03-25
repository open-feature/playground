import { parseValidJsonObject, parseValidNumber } from '@openfeature/utils';
import {
  EvaluationContext,
  FlagValue,
  Hook,
  JsonValue,
  Logger,
  Provider,
  ProviderEvents,
  ProviderMetadata,
  ResolutionDetails,
  TypeMismatchError,
} from '@openfeature/web-sdk';
import { SplitFactory } from '@splitsoftware/splitio-browserjs';
import { EventEmitter } from 'events';

const ANONYMOUS = 'anonymous';

/**
 * NOTE: This is an unofficial provider that was created for demonstration
 * purposes only. The playground environment will be updated to use official
 * providers once they're available.
 */
export class SplitWebProvider implements Provider {
  private factory!: SplitIO.ISDK;
  private client!: SplitIO.IClient;

  events = new EventEmitter();

  constructor(private readonly authorizationKey: string) {}

  initialize(context: EvaluationContext): Promise<void> {
    this.factory = SplitFactory({
      core: {
        authorizationKey: this.authorizationKey,
        // In this demo, we are treating the `email` as the user-id.
        // In a production provider, this would be the targetingKey.
        // When it's changed, we need to create a new client, because the
        // split client is what holds our long-lived context.
        key: context['email'] as string || ANONYMOUS,
      },
    });
    this.client = this.factory.client();
    this.client.setAttributes(JSON.parse(JSON.stringify(context)));
    this.addChangeListener(this.client);
    return new Promise((resolve) => {
      this.client.ready().then(() => {
        resolve();
      });
    });
  }

  metadata: ProviderMetadata = {
    name: 'Split web provider',
  };

  hooks?: Hook<FlagValue>[] | undefined;

  async onContextChange?(oldContext: EvaluationContext, newContext: EvaluationContext): Promise<void> {
    if (oldContext['email'] !== newContext['email']) {
      await this.resetClient(newContext);
    }
    this.client.setAttributes(JSON.parse(JSON.stringify(newContext)));
  }

  resolveBooleanEvaluation(
    flagKey: string,
    defaultValue: boolean,
    context: EvaluationContext,
    logger: Logger
  ): ResolutionDetails<boolean> {
    const treatment = this.resolve(flagKey);
    let value: boolean;
    switch (treatment as unknown) {
      case 'on':
        value = true;
        break;
      case 'off':
        value = false;
        break;
      case 'true':
        value = true;
        break;
      case 'false':
        value = false;
        break;
      case true:
        value = true;
        break;
      case false:
        value = false;
        break;
      default:
        throw new TypeMismatchError(`Invalid boolean value for ${treatment}`);
    }
    return { value };
  }
  resolveStringEvaluation(
    flagKey: string,
    defaultValue: string,
    context: EvaluationContext,
    logger: Logger
  ): ResolutionDetails<string> {
    return {
      value: this.resolve(flagKey),
    };
  }
  resolveNumberEvaluation(
    flagKey: string,
    defaultValue: number,
    context: EvaluationContext,
    logger: Logger
  ): ResolutionDetails<number> {
    return {
      value: parseValidNumber(this.resolve(flagKey)),
    };
  }
  resolveObjectEvaluation<T extends JsonValue>(
    flagKey: string,
    defaultValue: T,
    context: EvaluationContext,
    logger: Logger
  ): ResolutionDetails<T> {
    return {
      value: parseValidJsonObject(this.resolve(flagKey)),
    };
  }

  async onClose?() {
    this.client.destroy();
  }

  // update the client
  private async resetClient(newContext: EvaluationContext) {
    const newClient = this.factory.client((newContext['email'] as string) || ANONYMOUS);
    await newClient.ready();
    this.addChangeListener(newClient);
    this.client = newClient;
  }

  private addChangeListener(client: SplitIO.IClient) {
    client.addListener(client.Event.SDK_UPDATE, () => {
      this.events.emit(ProviderEvents.ConfigurationChanged);
    });
  }

  private resolve(flagKey: string): string {
    // this could be called while we are awaiting the new client.
    // should we return reason = STALE here?
    return this.client.getTreatment(flagKey);
  }
}
