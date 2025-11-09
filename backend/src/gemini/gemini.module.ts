import { Module } from '@nestjs/common';
import { GeminiController } from './presenters/http/gemini.controller';
import { GeminiService } from './application/gemini.service';
import {
  GeminiProModelProvider,
  GeminiFlashModelProvider,
} from './application/gemini.provider';
import { GeminiGateway } from './gemini.gateway';
import { PersonaChatService } from './application/persona-chat.service';
import { PersonasModule } from 'src/db/personas/personas.module';

@Module({
  imports: [PersonasModule],
  controllers: [GeminiController],
  providers: [
    GeminiService,
    PersonaChatService,
    GeminiProModelProvider,
    GeminiFlashModelProvider,
    GeminiGateway,
  ],
})
export class GeminiModule {}
