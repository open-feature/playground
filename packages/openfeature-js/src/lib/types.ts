export type Context = { userId?: string } & Record<string, string | number | boolean>;

export type FlagType = 'enabled' | 'boolean' | 'string' | 'number' | 'json';

export interface FlagEvaluationOptions {
  hooks?: Hook[];
}

/**
 * This interface is presented to the application author
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

export type ContextTransformer<T = unknown> = (context: Context) => T

/**
 * Interface that providers must implement to resolve flag values for their particular
 * backend or vendor.
 * 
 * Implementation for resolving all the required flag types must be defined.
 * 
 * Additionally, a ContextTransformer function that transforms the OpenFeature context to the requisite user/context/attribute representation (typeof T)
 * must also be implemented. This function will run immediately before the flag value resolver functions, appropriately transforming the context.
 */
export interface FeatureProvider<T = unknown> {
  name: string;
  contextTransformer: ContextTransformer<T>;
  /**
   * Resolve a flag's activity. In some providers, this may be distinct from getting a boolean flag value.
   */
   isEnabled(
    flagId: string,
    defaultValue: boolean,
    transformedContext?: T,
    options?: FlagEvaluationOptions
  ): Promise<boolean>;

  /**
   * Resolve a boolean flag value. In some providers, this may be distinct from getting a flag's activity.
   */
  getBooleanValue(
    flagId: string,
    defaultValue: boolean,
    transformedContext?: T,
    options?: FlagEvaluationOptions
  ): Promise<boolean>;

  /**
   * Resolve a string flag value.
   */
  getStringValue(
    flagId: string,
    defaultValue: string,
    transformedContext?: T,
    options?: FlagEvaluationOptions
  ): Promise<string>;

  /**
   * Resolve a numeric flag value.
   */
  getNumberValue(
    flagId: string,
    defaultValue: number,
    transformedContext?: T,
    options?: FlagEvaluationOptions
  ): Promise<number>;

  /**
   * Resolve an object flag value.
   */
  getObjectValue<U extends object>(
    flagId: string,
    defaultValue: U,
    transformedContext?: T,
    options?: FlagEvaluationOptions
  ): Promise<U>;
}

// consider this name.
export interface HasHooks {
  registerHooks(...hooks: Hook[]): void;
  get hooks(): Hook[];
}

export interface ProviderOptions<T = unknown> {
  contextTransformer?: ContextTransformer<T>;
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