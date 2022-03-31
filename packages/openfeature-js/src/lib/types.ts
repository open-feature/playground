import { OpenFeatureClient } from './client';

export type Context = { userId?: string } & Record<string, unknown>;

export type FlagType = 'enabled' | 'boolean' | 'string' | 'number' | 'json';

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
    context?: Context
  ): Promise<boolean>;

  /**
   * Get a boolean flag value.
   */
  getBooleanValue(
    flagId: string,
    defaultValue: boolean,
    context?: Context
  ): Promise<boolean>;

  /**
   * Get a string flag value.
   */
  getStringValue(
    flagId: string,
    defaultValue: string,
    context?: Context
  ): Promise<string>;

  /**
   * Get a number flag value.
   */
  getNumberValue(
    flagId: string,
    defaultValue: number,
    context?: Context
  ): Promise<number>;

  /**
   * Get a object (JSON) flag value.
   */
  getObjectValue<T extends object>(
    flagId: string,
    defaultValue: T,
    context?: Context
  ): Promise<T>;
}

export interface FeatureProvider extends Features {
  name: string;
}

export abstract class Client implements Features {
  protected hooks: Hook[] = [];

  abstract isEnabled(
    flagId: string,
    defaultValue: boolean,
    context?: Context
  ): Promise<boolean>;
  abstract getBooleanValue(
    flagId: string,
    defaultValue: boolean,
    context?: Context
  ): Promise<boolean>;
  abstract getStringValue(
    flagId: string,
    defaultValue: string,
    context?: Context
  ): Promise<string>;
  abstract getNumberValue(
    flagId: string,
    defaultValue: number,
    context?: Context
  ): Promise<number>;
  abstract getObjectValue<T extends object>(
    flagId: string,
    defaultValue: T,
    context?: Context
  ): Promise<T>;

  registerHooks(...hooks: Hook[]): void {
    this.hooks = [...this.hooks, ...hooks];
  }
}

export type HookContext = {
  flagId: string;
  flagType: FlagType;
  provider: FeatureProvider;
  client: OpenFeatureClient;
  context: Context;
};

export interface Hook<T = unknown> {
  before?(hookContext: HookContext): Context;
  after?(hookContext: HookContext, flagValue: T): T;
  error?(hookContext: HookContext, error: Error): void;
  finally?(hookContext: HookContext, flagValue?: T): void;
}

export interface FlagEvaluationOptions {
  context: Context;
  hooks: Hook[];
}
