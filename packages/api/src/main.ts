/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
import * as express from 'express';
import {
  FlagEvaluationDetails,
  openfeature,
} from '@openfeature/openfeature-js';
import { fibonacci } from '@openfeature/fibonacci';
import { query, validationResult } from 'express-validator';
import {
  OpenTelemetryHook,
  LoggingHook,
  ClassValidatorHook,
} from '@openfeature/extra';
import { buildHelloMarkup } from './hello-markup';
import { InstallTemplateData } from './types';
import { buildInstallMarkup } from './install-markup';
import { InstallTemplate } from './install-template';

const app = express();
const appName = 'api';

openfeature.registerHooks(new OpenTelemetryHook(appName));
const client = openfeature.getClient(appName);
client.registerHooks(new LoggingHook());

app.get('/api', async (req, res) => {
  const message = (await client.isEnabled('new-welcome-message', false))
    ? 'Welcome to the next gen api!'
    : 'Welcome to the api!';
  res.send({ message });
});

app.get('/hello', async (req, res) => {
  const hexColor = await client.getStringValue(
    'hex-color',
    '000000',
    undefined,
    {
      hooks: [
        {
          name: '',
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
  res.contentType('html').send(buildHelloMarkup(hexColor));
});

app.get(
  '/fibonacci',
  query('num')
    .default(1)
    .isInt({ min: 1, max: 50 })
    .withMessage('The number must be between 1 and 50.'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const num = Number(req.query!.num);
    const output = await fibonacci(num);
    res.status(200).send(`${output}`);
  }
);

app.get('/install', async (req, res) => {
  // get the platform
  const platform = (
    (req.header('Sec-CH-UA-Platform') as string) || 'Windows'
  ).replace(/"/g, '');

  // add to the attributes
  const attributes = {
    platform,
  };

  // pass it to our evaluation, adding a validator
  const installTemplate = await client.getObjectValue<InstallTemplateData>(
    'installation-instructions',
    new InstallTemplate(),
    attributes,
    {
      hooks: [new ClassValidatorHook(InstallTemplate)],
    }
  );
  res.contentType('html').send(buildInstallMarkup(installTemplate));
});

const port = process.env.port || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
