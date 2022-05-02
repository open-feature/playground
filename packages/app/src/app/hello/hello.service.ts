import { Inject, Injectable } from '@nestjs/common';
import { Client, FlagEvaluationDetails } from '@openfeature/openfeature-js';
import { OPENFEATURE_CLIENT, REQUEST_DATA } from '../constants';

@Injectable()
export class HelloService {
  constructor(@Inject(OPENFEATURE_CLIENT) private client: Client) {}

  async buildHelloMarkup() {
    const hexColorValue = await this.client.getStringValue(
      'hex-color',
      '000000',
      undefined,
      {
        hooks: [
          {
            name: 'validate-hex',
            after: (
              hookContext,
              evaluationDetails: FlagEvaluationDetails<string>
            ) => {
              // validate the hex value.
              const hexPattern = /[0-9A-Fa-f]{6}/g;
              if (hexPattern.test(evaluationDetails.value)) {
                return evaluationDetails.value;
              } else {
                console.warn(
                  `Got invalid flag value '${evaluationDetails.value}' for ${hookContext.flagKey}, returning ${hookContext.defaultValue}`
                );
                return hookContext.defaultValue;
              }
            },
          },
        ],
      }
    );
    return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>OpenFeature</title>
  </head>
  <body>
  	<span>Welcome to</span>
    <span style="color: #${hexColorValue};">OpenFeature!</span>
  </body>
</html>
`;
  }
}
