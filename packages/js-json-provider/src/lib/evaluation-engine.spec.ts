import { EvaluationEngine } from './evaluation-engine';
describe('EvaluationEngine', () => {
  it('should return the default values', () => {
    const evaluationEngine = new EvaluationEngine({
      newWelcomeMessage: {
        state: 'enabled',
        rules: [],
        variants: {
          on: true,
          off: false,
        },
        defaultVariant: 'on',
        returnType: 'boolean',
      },
    });

    expect(
      evaluationEngine.evaluate('newWelcomeMessage', 'boolean', {})
    ).toBeTruthy();
  });

  it('should return the default values', () => {
    const evaluationEngine = new EvaluationEngine({
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
            target: {
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
    });

    expect(
      evaluationEngine.evaluate('fibAlgo', 'string', { email: 'user@test.com' })
    ).toEqual({
      value: 'binet',
      variant: 'binet',
      reason: 'Rule match',
    });
  });
});
