import { Module } from '@nestjs/common';
import { GeminiController } from './presenters/http/gemini.controller';
import { GeminiService } from './application/gemini.service';
import { GeminiProModelProvider } from './application/gemini.provider';

@Module({
  controllers: [GeminiController],
  providers: [GeminiService, GeminiProModelProvider],
})
export class GeminiModule {}
