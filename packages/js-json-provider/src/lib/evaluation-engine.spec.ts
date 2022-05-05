import { EvaluationEngine } from './evaluation-engine';
import Ajv2020 from 'ajv/dist/2020';
import { OpenFeatureFeatureFlags } from './flag';

const schema = require('../../../../schemas/flag.schema.json');

const ajv = new Ajv2020({
  useDefaults: true,
  allowUnionTypes: true,
  allowMatchingProperties: false,
});

const validate = ajv.compile<OpenFeatureFeatureFlags>(schema);

describe('EvaluationEngine', () => {
  it('should return the default values', () => {
    const flags: OpenFeatureFeatureFlags = {
      newWelcomeMessage: {
        state: 'enabled',
      },
    };
    const valid = validate(flags);
    expect(valid).toBe(true);
    const evaluationEngine = new EvaluationEngine();
    expect(
      evaluationEngine.evaluate(flags, 'newWelcomeMessage', 'boolean', {})
    ).toBeTruthy();
  });

  it('should return the default values', () => {
    const flags: OpenFeatureFeatureFlags = {
      fibAlgo: {
        returnType: 'string',
        variants: {
          recursive: 'recursive',
          memo: 'memo',
          loop: 'loop',
          binet: 'binet',
        },
        defaultVariant: 'recursive',
        state: 'enabled',
        rules: [
          {
            action: {
              variant: 'binet',
            },
            conditions: [
              {
                context: 'email',
                op: 'equals',
                value: 'user@test.com',
              },
            ],
          },
        ],
      },
    };
    const valid = validate(flags);
    expect(valid).toBe(true);

    const evaluationEngine = new EvaluationEngine();

    expect(
      evaluationEngine.evaluate(flags, 'fibAlgo', 'string', {
        email: 'user@test.com',
      })
    ).toEqual({
      value: 'binet',
      variant: 'binet',
      reason: 'Rule match',
    });
  });
});
