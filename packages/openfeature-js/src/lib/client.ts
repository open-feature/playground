import { OpenFeatureAPI } from './api';
import { NOOP_FEATURE_PROVIDER } from './noop-provider';
import { Client, Context, FeatureProvider, FlagType, Hook } from './types';

type OpenFeatureClientOptions = {
  name?: string;
  version?: string;
};

export class OpenFeatureClient extends Client {
  public readonly name?: string;
  public readonly version?: string;

  constructor(
    private readonly api: OpenFeatureAPI,
    options: OpenFeatureClientOptions
  ) {
    super();
    this.name = options.name;
    this.version = options.version;
  }

  isEnabled(
    flagId: string,
    defaultValue: boolean,
    context?: Context
  ): Promise<boolean> {
    return this.evaluateFlag('enabled', flagId, defaultValue, context);
  }

  getBooleanValue(
    flagId: string,
    defaultValue: boolean,
    context?: Context
  ): Promise<boolean> {
    return this.evaluateFlag('boolean', flagId, defaultValue, context);
  }

  getStringValue(
    flagId: string,
    defaultValue: string,
    context?: Context
  ): Promise<string> {
    return this.evaluateFlag('string', flagId, defaultValue, context);
  }

  getNumberValue(
    flagId: string,
    defaultValue: number,
    context?: Context
  ): Promise<number> {
    return this.evaluateFlag('number', flagId, defaultValue, context);
  }

  getObjectValue<T extends object>(
    flagId: string,
    defaultValue: T,
    context?: Context
  ): Promise<T> {
    return this.evaluateFlag('json', flagId, defaultValue, context);
  }

  private async evaluateFlag<T extends boolean | string | number | object>(
    flagType: FlagType,
    flagId: string,
    defaultValue: T,
    context: Context = {}
  ): Promise<T> {
    const provider = this.getProvider();
    try {
      const mergedContext = this.hooks.reduce(
        (accumulated: Context, hook: Hook): Context => {
          if (typeof hook?.before === 'function') {
            return {
              ...accumulated,
              ...hook.before({
                flagId,
                flagType,
                context: accumulated,
                client: this,
                provider,
              }),
            };
          }
          return accumulated;
        },
        context
      );

      let valuePromise: Promise<boolean | string | number | object>;
      switch (flagType) {
        case 'enabled': {
          valuePromise = provider.isEnabled(
            flagId,
            defaultValue as boolean,
            context
          );
          break;
        }
        case 'boolean': {
          valuePromise = provider.getBooleanValue(
            flagId,
            defaultValue as boolean,
            context
          );
          break;
        }
        case 'string': {
          valuePromise = provider.getStringValue(
            flagId,
            defaultValue as string,
            context
          );
          break;
        }
        case 'number': {
          valuePromise = provider.getNumberValue(
            flagId,
            defaultValue as number,
            context
          );
          break;
        }
        case 'json': {
          valuePromise = provider.getObjectValue(
            flagId,
            defaultValue as object,
            context
          );
          break;
        }
      }

      const value = await valuePromise;

      const updatedValue = this.hooks.reduce((_: unknown, hook) => {
        if (typeof hook?.after === 'function') {
          return hook.after(
            {
              flagId,
              flagType,
              context: mergedContext,
              client: this,
              provider,
            },
            value
          );
        }
      }, value);

      this.hooks.forEach((hook) => {
        if (typeof hook?.finally === 'function') {
          return hook.finally(
            {
              flagId,
              flagType,
              context: mergedContext,
              client: this,
              provider,
            },
            value
          );
        }
      });

      return updatedValue as T;
    } catch (err) {
      if (this.isError(err)) {
        // Workaround for error scoping issue
        const error = err;
        this.hooks.forEach((hook) => {
          if (typeof hook?.error === 'function') {
            return hook.error(
              {
                flagId,
                flagType,
                // TODO: This may not be the last version of context.
                context,
                client: this,
                provider,
              },
              error
            );
          }
        });
      }
      return defaultValue;
    }
  }

  private getProvider(): FeatureProvider {
    return this.api.getProvider() ?? NOOP_FEATURE_PROVIDER;
  }

  private isError(err: unknown): err is Error {
    return (
      (err as Error).stack !== undefined && (err as Error).message !== undefined
    );
  }
}
