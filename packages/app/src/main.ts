import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const logger = app.get(Logger);
  app.useLogger(app.get(Logger));
  app.useGlobalInterceptors(new LoggerErrorInterceptor());
  app.enableCors();
  const port = process.env.PORT || 30000;
  await app.listen(port);
  logger.log(`🚀 Application is running on: http://localhost:${port}`);
}

bootstrap();
