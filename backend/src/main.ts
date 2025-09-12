import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import express from 'express';
import compression from 'compression';
import { envConfig } from './config/env.config';
import { validateConfig } from './config/validate.config';

function setupSwagger(app: NestExpressApplication) {
  const config = new DocumentBuilder()
    .setTitle('Gemini example')
    .setDescription('The Gemini API description')
    .setVersion('1.0')
    .addTag('google gemini')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors();
  app.useGlobalPipes(validateConfig);
  app.use(express.json({ limit: '1000kb' }));
  app.use(express.urlencoded({ extended: false }));
  app.use(compression());
  setupSwagger(app);
  await app.listen(envConfig.port);
}
bootstrap();
