import {
  Context,
  FeatureProvider,
  GeneralError,
  ProviderEvaluation,
} from '@openfeature/openfeature-js';
import Ajv2020 from 'ajv/dist/2020';
import { copyFileSync, existsSync } from 'fs';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { EvaluationEngine } from './evaluation-engine';
import { OpenFeatureFeatureFlags } from './flag';

import schema from '../../../../schemas/flag.schema.json';

const EXAMPLE_JSON_FILE = 'flags.json.example';
const JSON_FILE = 'flags.json';

const ajv = new Ajv2020({
  useDefaults: true,
  allowUnionTypes: true,
  allowMatchingProperties: false,
});

const validate = ajv.compile<OpenFeatureFeatureFlags>(schema);

export class JsonProvider implements FeatureProvider {
  private readonly evaluationEngine = new EvaluationEngine();

  constructor() {
    // if the .json file doesn't exist, copy the example.
    if (!existsSync(join(JSON_FILE))) {
      copyFileSync(EXAMPLE_JSON_FILE, JSON_FILE);
    }
  }

  name = 'json';

  async getBooleanEvaluation(
    flagKey: string,
    _: boolean,
    context: Context
  ): Promise<ProviderEvaluation<boolean>> {
    const flags = await this.getFlags();
    return this.evaluationEngine.evaluate(flags, flagKey, 'boolean', context);
  }

  async getStringEvaluation(
    flagKey: string,
    _: string,
    context: Context
  ): Promise<ProviderEvaluation<string>> {
    const flags = await this.getFlags();
    return this.evaluationEngine.evaluate(flags, flagKey, 'string', context);
  }

  async getNumberEvaluation(
    flagKey: string,
    _: number,
    context: Context
  ): Promise<ProviderEvaluation<number>> {
    const flags = await this.getFlags();
    return this.evaluationEngine.evaluate(flags, flagKey, 'number', context);
  }

  async getObjectEvaluation<U extends object>(
    flagKey: string,
    _: U,
    context: Context
  ): Promise<ProviderEvaluation<U>> {
    const flags = await this.getFlags();
    return this.evaluationEngine.evaluate(flags, flagKey, 'json', context);
  }

  private async getFlags() {
    const flags = JSON.parse((await readFile(JSON_FILE)).toString());
    const valid = validate(flags);
    if (!valid) {
      throw new GeneralError('Invalid flag config');
    }

    return flags;
  }
}
