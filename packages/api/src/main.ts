/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
import * as express from 'express';
import { openfeature } from '@openfeature/openfeature-js';
import { fibonacci } from '@openfeature/fibonacci';
import { query, validationResult } from 'express-validator';
import { OpenTelemetryHook, LoggingHook } from '@openfeature/extra';
import { buildMarkup } from './markup';

const app = express();

openfeature.registerHooks(new OpenTelemetryHook('test'));
const client = openfeature.getClient('api');
client.registerHooks(new LoggingHook());

app.get('/api', async (req, res) => {
  const message = (await client.getBooleanValue(
    'new-welcome-message',
    false
  ))
    ? 'Welcome to the next gen api!'
    : 'Welcome to the api!';
  res.send({ message });
});

app.get('/hello', async (req, res) => {
  const hexColor = (await client.getStringValue(
    'hex-color',
    '000000',
    {
      hooks: [
        {
          after: (hookContext, flagValue: string) => {
            // validate the hex value.
            const hexPattern = /[0-9A-Fa-f]{6}/g;
            if (hexPattern.test(flagValue)) {
              return flagValue;
            } else {
              console.warn(`Got invalid flag value '${flagValue}' for ${hookContext.flagId}, returning ${hookContext.defaultValue}`)
              return hookContext.defaultValue;
            }
          }
        }
      ]
    }
  ));
  res.contentType('html').send(buildMarkup(hexColor));
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

const port = process.env.port || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
