// src/main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // The 'useWebSocketAdapter' line has been removed.

  await app.listen(3000);
}
bootstrap();
