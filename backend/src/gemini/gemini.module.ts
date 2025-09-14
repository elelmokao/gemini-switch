import { Module } from '@nestjs/common';
import { GeminiController } from './presenters/http/gemini.controller';
import { GeminiService } from './application/gemini.service';
import {
  GeminiProModelProvider,
  GeminiFlashModelProvider,
} from './application/gemini.provider';
import { GeminiGateway } from './gemini.gateway';

@Module({
  controllers: [GeminiController],
  providers: [
    GeminiService,
    GeminiProModelProvider,
    GeminiFlashModelProvider,
    GeminiGateway,
  ],
})
export class GeminiModule {}
