import { Inject, Injectable } from '@nestjs/common';
import { Client, EvaluationDetails } from '@openfeature/openfeature-js';
import { OPENFEATURE_CLIENT } from '../constants';

@Injectable()
export class HexColorService {
  constructor(@Inject(OPENFEATURE_CLIENT) private client: Client) {}

  async getHexColor() {
    const hexColorValue = await this.client.getStringValue(
      'hex-color',
      '000000',
      undefined,
      {
        hooks: [
          {
            after: (
              hookContext,
              evaluationDetails: EvaluationDetails<string>
            ) => {
              // validate the hex value.
              const hexPattern = /[0-9A-Fa-f]{6}/g;
              if (!hexPattern.test(evaluationDetails.value)) {
                console.warn(
                  `Got invalid flag value '${evaluationDetails.value}' for ${hookContext.flagKey}, returning ${hookContext.defaultValue}`
                );
                throw new Error(
                  `Invalid hex value: ${evaluationDetails.value}`
                );
              }
            },
          },
        ],
      }
    );
    return `#${hexColorValue}`;
  }

  async buildHexColorMarkup() {
    const hexColorValue = await this.getHexColor();
    return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>OpenFeature</title>
  </head>
  <body>
  	<span>Welcome to</span>
    <span style="color: ${hexColorValue};">OpenFeature!</span>
  </body>
</html>
`;
  }
}
