import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { RedisIoAdapter } from './adapters/redis-io.adapter';
import { AppModule } from './app.module';

const API_DEFAULT_PORT = 8000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useWebSocketAdapter(new RedisIoAdapter(app));
  await app.listen(process.env.API_PORT || API_DEFAULT_PORT);
}
bootstrap();
