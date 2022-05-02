export type Context = { userId?: string } & Record<
  string,
  string | number | boolean
>;

// export type Context = Record<string, unknown>;

export type FlagValueType =
  | 'enabled'
  | 'boolean'
  | 'string'
  | 'number'
  | 'json';

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
    flagKey: string,
    defaultValue: boolean,
    context?: Context,
    options?: FlagEvaluationOptions
  ): Promise<boolean>;

  /**
   * Get a boolean flag with additional details.
   *
   * NOTE: In some providers this has distinct behavior from getBooleanDetails
   */
  isEnabledDetails(
    flagKey: string,
    defaultValue: boolean,
    context?: Context,
    options?: FlagEvaluationOptions
  ): Promise<FlagEvaluationDetails<boolean>>;

  /**
   * Get a boolean flag value.
   */
  getBooleanValue(
    flagKey: string,
    defaultValue: boolean,
    context?: Context,
    options?: FlagEvaluationOptions
  ): Promise<boolean>;

  /**
   * Get a boolean flag with additional details.
   */
  getBooleanDetails(
    flagKey: string,
    defaultValue: boolean,
    context?: Context,
    options?: FlagEvaluationOptions
  ): Promise<FlagEvaluationDetails<boolean>>;

  /**
   * Get a string flag value.
   */
  getStringValue(
    flagKey: string,
    defaultValue: string,
    context?: Context,
    options?: FlagEvaluationOptions
  ): Promise<string>;

  /**
   * Get a string flag with additional details.
   */
  getStringDetails(
    flagKey: string,
    defaultValue: string,
    context?: Context,
    options?: FlagEvaluationOptions
  ): Promise<FlagEvaluationDetails<string>>;

  /**
   * Get a number flag value.
   */
  getNumberValue(
    flagKey: string,
    defaultValue: number,
    context?: Context,
    options?: FlagEvaluationOptions
  ): Promise<number>;

  /**
   * Get a number flag with additional details.
   */
  getNumberDetails(
    flagKey: string,
    defaultValue: number,
    context?: Context,
    options?: FlagEvaluationOptions
  ): Promise<FlagEvaluationDetails<number>>;

  /**
   * Get an object (JSON) flag value.
   */
  getObjectValue<T extends object>(
    flagKey: string,
    defaultValue: T,
    context?: Context,
    options?: FlagEvaluationOptions
  ): Promise<T>;

  /**
   * Get an object (JSON) flag with additional details.
   */
  getObjectValue<T extends object>(
    flagKey: string,
    defaultValue: T,
    context?: Context,
    options?: FlagEvaluationOptions
  ): Promise<FlagEvaluationDetails<T>>;
}

export type ContextTransformer<T = unknown> = (context: Context) => T;

interface GenericProvider<T> {
  name: string;

  /**
   * Resolve a flag's activity. In some providers, this may be distinct from
   * getting a boolean flag value.
   */
  isEnabledEvaluation(
    flagKey: string,
    defaultValue: boolean,
    transformedContext: T,
    options?: FlagEvaluationOptions | undefined
  ): Promise<ProviderEvaluation<boolean>>;

  /**
   * Resolve a boolean flag and it's evaluation details. In some providers, this may be distinct from getting a flag's activity.
   */
  getBooleanEvaluation(
    flagKey: string,
    defaultValue: boolean,
    transformedContext: T,
    options: FlagEvaluationOptions | undefined
  ): Promise<ProviderEvaluation<boolean>>;

  /**
   * Resolve a string flag and it's evaluation details.
   */
  getStringEvaluation(
    flagKey: string,
    defaultValue: string,
    transformedContext: T,
    options: FlagEvaluationOptions | undefined
  ): Promise<ProviderEvaluation<string>>;

  /**
   * Resolve a numeric flag and it's evaluation details.
   */
  getNumberEvaluation(
    flagKey: string,
    defaultValue: number,
    transformedContext: T,
    options: FlagEvaluationOptions | undefined
  ): Promise<ProviderEvaluation<number>>;

  /**
   * Resolve and parse an object flag and it's evaluation details.
   */
  getObjectEvaluation<U extends object>(
    flagKey: string,
    defaultValue: U,
    transformedContext: T,
    options: FlagEvaluationOptions | undefined
  ): Promise<ProviderEvaluation<U>>;
}

type NonTransformingProvider = GenericProvider<Context>;

interface TransformingProvider<T> extends GenericProvider<T> {
  contextTransformer: ContextTransformer<Promise<T> | T> | undefined;
}

/**
 * Interface that providers must implement to resolve flag values for their particular
 * backend or vendor.
 *
 * Implementation for resolving all the required flag types must be defined.
 *
 * Additionally, a ContextTransformer function that transforms the OpenFeature context to the requisite user/context/attribute representation (typeof T)
 * may also be implemented. This function will run immediately before the flag value resolver functions, appropriately transforming the context.
 */
export type FeatureProvider<T extends Context | unknown = Context> =
  T extends Context ? NonTransformingProvider : TransformingProvider<T>;

export interface FlagEvaluationLifeCycle {
  registerHooks(...hooks: Hook[]): void;
  get hooks(): Hook[];
}

export interface ProviderOptions<T = unknown> {
  contextTransformer?: ContextTransformer<T>;
}

export type ProviderEvaluation<T> = {
  value: T;
  variant?: string;
  reason: Reason | string;
  errorCode?: ErrorCode;
};

export type FlagEvaluationDetails<T extends FlagValue> = {
  flagKey: string;
  executedHooks: ExecutedHooks;
} & ProviderEvaluation<T>;

export type ExecutedHooks = {
  [P in keyof Omit<Hook<FlagValue>, 'name'>]-?: string[];
};

/**
 * TODO: Do we want OpenFeature to rigorously define a set of reasons and force providers to map their own reasons?
 * Do we anticipate Application Authors or Integrators writing logic based on these values, or are they
 * only important for diagnostics/telemetry/troubleshooting?
 */
export enum Reason {
  DISABLED = 'DISABLED',
  SPLIT = 'SPLIT',
  TARGETING_MATCH = 'TARGETING_MATCH',
  DEFAULT = 'DEFAULT',
  UNKNOWN = 'UNKNOWN',
  ERROR = 'ERROR',
}

export enum ErrorCode {
  PROVIDER_NOT_READY = 'PROVIDER_NOT_READY',
  FLAG_NOT_FOUND = 'FLAG_NOT_FOUND',
  PARSE_ERROR = 'PARSE_ERROR',
  TYPE_MISMATCH = 'TYPE_MISMATCH',
  GENERAL = 'GENERAL',
}

export interface HasTransactionContext extends TransactionContext {
  registerTransactionContextPropagator(
    transactionContext: TransactionContext
  ): void;
}

export interface TransactionContext {
  getTransactionContext(): Context;
  setTransactionContext(context: Context, callback: () => void): void;
}

export interface Client extends FlagEvaluationLifeCycle, Features {
  readonly name?: string;
  readonly version?: string;
}

export type HookContext = {
  flagKey: string;
  flagValueType: FlagValueType;
  client: Client;
  context: Context;
  provider: FeatureProvider;
  defaultValue: FlagValue;
  executedHooks: ExecutedHooks;
};

export type FlagValue = boolean | string | number | object;

export interface Hook<T extends FlagValue = FlagValue> {
  name: string;
  before?(hookContext: Readonly<HookContext>): Context | void;
  after?(
    hookContext: Readonly<HookContext>,
    evaluationDetails: FlagEvaluationDetails<T>
  ): T | void;
  error?(hookContext: Readonly<HookContext>, error: Error): void;
  finally?(hookContext: Readonly<HookContext>): void;
}
