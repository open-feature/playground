import { OpenFeatureAPI } from './api';
import { NOOP_FEATURE_PROVIDER } from './noop-provider';
import { Client, Context, FeatureProvider, FlagEvaluationOptions, FlagType, FlagValue, Hook, HookContext } from './types';

type OpenFeatureClientOptions = {
  name?: string;
  version?: string;
};

export class OpenFeatureClient implements Client {
  readonly name?: string;
  readonly version?: string;

  private _hooks: Hook[] = [];

  constructor(
    private readonly api: OpenFeatureAPI,
    options: OpenFeatureClientOptions
  ) {
    this.name = options.name;
    this.version = options.version;
  }

  get hooks(): Hook[] {
    return this._hooks;
  }

  registerHooks(...hooks: Hook<FlagValue>[]): void {
    this._hooks = hooks;
  }

  isEnabled(
    flagId: string,
    defaultValue: boolean,
    context: Context,
    options?: FlagEvaluationOptions
  ): Promise<boolean> {
    return this.evaluateFlag('enabled', flagId, defaultValue, context, options);
  }

  getBooleanValue(
    flagId: string,
    defaultValue: boolean,
    context: Context,
    options?: FlagEvaluationOptions
  ): Promise<boolean> {
    return this.evaluateFlag('boolean', flagId, defaultValue, context, options);
  }

  getStringValue(
    flagId: string,
    defaultValue: string,
    context: Context,
    options?: FlagEvaluationOptions
  ): Promise<string> {
    return this.evaluateFlag('string', flagId, defaultValue, context, options);
  }

  getNumberValue(
    flagId: string,
    defaultValue: number,
    context: Context,
    options?: FlagEvaluationOptions
  ): Promise<number> {
    return this.evaluateFlag('number', flagId, defaultValue, context, options);
  }

  getObjectValue<T extends object>(
    flagId: string,
    defaultValue: T,
    context: Context,
    options?: FlagEvaluationOptions
  ): Promise<T> {
    return this.evaluateFlag('json', flagId, defaultValue, context, options);
  }

  private async evaluateFlag<T extends FlagValue>(
    flagType: FlagType,
    flagId: string,
    defaultValue: T,
    context: Context,
    options?: FlagEvaluationOptions
  ): Promise<T> {
    const provider = this.getProvider();
    const flagHooks = options?.hooks ?? [];
    const allHooks: Hook<FlagValue>[] = [...OpenFeatureAPI.getInstance().hooks , ...this.hooks, ...flagHooks];
    context = context ?? {};
    let hookContext: HookContext = {
      flagId,
      flagType,
      defaultValue,
      context,
      client: this,
      provider: this.getProvider()
    };
    let valuePromise: Promise<FlagValue>;
    
    try {
      hookContext = this.beforeEvaluation(allHooks, hookContext);
      switch (flagType) {
        case 'enabled': {
          valuePromise = provider.isEnabled(
            flagId,
            defaultValue as boolean,
            context,
            options
          );
          break;
        }
        case 'boolean': {
          valuePromise = provider.getBooleanValue(
            flagId,
            defaultValue as boolean,
            context,
            options
          );
          break;
        }
        case 'string': {
          valuePromise = provider.getStringValue(
            flagId,
            defaultValue as string,
            context,
            options
          );
          break;
        }
        case 'number': {
          valuePromise = provider.getNumberValue(
            flagId,
            defaultValue as number,
            context,
            options
          );
          break;
        }
        case 'json': {
          valuePromise = provider.getObjectValue(
            flagId,
            defaultValue as object,
            context,
            options
          );
          break;
        }
      }

      const value = await valuePromise;
      return this.afterEvaluation(allHooks, hookContext, value) as T;
    } catch (err) {
      if (this.isError(err)) {
        this.errorEvaluation(allHooks, hookContext, err);
      }
      return defaultValue;
    } finally {
      this.finallyEvaluation(allHooks, hookContext);
    }
  }

  private beforeEvaluation(allHooks: Hook[], hookContext: HookContext): HookContext {
    const mergedContext = allHooks.reduce(
      (accumulated: Context, hook: Hook): Context => {
        if (typeof hook?.before === 'function') {
          return {
            ...accumulated,
            ...hook.before(hookContext),
          };
        }
        return accumulated;
      },
      hookContext.context
    );
    hookContext.context = mergedContext;
    return hookContext;
  }

  private afterEvaluation(allHooks: Hook[], hookContext: HookContext, flagValue: FlagValue): FlagValue {
    return allHooks.reduce((accumulated: FlagValue, hook) => {
      if (typeof hook?.after === 'function') {
        return hook.after(hookContext, flagValue);
      }
      return accumulated;
    }, flagValue);
  }

  private finallyEvaluation(allHooks: Hook[], hookContext: HookContext): void {
    allHooks.forEach((hook) => {
      if (typeof hook?.finally === 'function') {
        return hook.finally(hookContext);
      }
    });
  }

  private errorEvaluation(allHooks: Hook[], hookContext: HookContext, err: Error): void {
    // Workaround for error scoping issue
    const error = err;
    allHooks.forEach((hook) => {
      if (typeof hook?.error === 'function') {
        return hook.error(hookContext, error);
      }
    });
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
