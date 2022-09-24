import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
// import { FlagsmithV1Provider } from '@openfeature/js-flagsmith-v1-provider';
// import { JsonProvider } from '@openfeature/js-json-provider';
// import { Flagsmith } from 'flagsmithv2';
// import * as Flagsmith from "flagsmith-nodejs";
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const port = process.env.PORT || 30000;
  await app.listen(port);
  Logger.log(`🚀 Application is running on: http://localhost:${port}`);
}

bootstrap();
