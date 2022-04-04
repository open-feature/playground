export type Context = { userId?: string } & Record<string, unknown>;

export type FlagType = 'enabled' | 'boolean' | 'string' | 'number' | 'json';

export interface FlagEvaluationOptions {
  hooks?: Hook[];
}

/**
 * This interface is common to both Providers and the SDK presented to the Application Author.
 * This is incidental, and may not continue to be the case, especially as additional configuration is provided.
 */
export interface Features {
  /**
   * Get a boolean flag value.
   *
   * NOTE: In some providers this has distinct behavior from getBooleanValue
   */
  isEnabled(
    flagId: string,
    defaultValue: boolean,
    context?: Context,
    options?: FlagEvaluationOptions
  ): Promise<boolean>;

  /**
   * Get a boolean flag value.
   */
  getBooleanValue(
    flagId: string,
    defaultValue: boolean,
    context?: Context,
    options?: FlagEvaluationOptions
  ): Promise<boolean>;

  /**
   * Get a string flag value.
   */
  getStringValue(
    flagId: string,
    defaultValue: string,
    context?: Context,
    options?: FlagEvaluationOptions
  ): Promise<string>;

  /**
   * Get a number flag value.
   */
  getNumberValue(
    flagId: string,
    defaultValue: number,
    context?: Context,
    options?: FlagEvaluationOptions
  ): Promise<number>;

  /**
   * Get a object (JSON) flag value.
   */
  getObjectValue<T extends object>(
    flagId: string,
    defaultValue: T,
    context?: Context,
    options?: FlagEvaluationOptions
  ): Promise<T>;
}

export interface FeatureProvider extends Features {
  name: string;
}

// consider this name.
export interface HasHooks {
  registerHooks(...hooks: Hook[]): void;
  get hooks(): Hook[];
}

export interface Client extends HasHooks, Features {
  readonly name?: string;
  readonly version?: string;
}

export type HookContext = {
  flagId: string;
  flagType: FlagType;
  provider: FeatureProvider;
  client: Client;
  context: Context;
  defaultValue: FlagValue;
};

export type FlagValue = boolean | string | number | object;

export interface Hook<T = FlagValue> {
  before?(hookContext: HookContext): Context;
  after?(hookContext: HookContext, flagValue: T): T;
  error?(hookContext: HookContext, error: Error): void;
  finally?(hookContext: HookContext): void;
}