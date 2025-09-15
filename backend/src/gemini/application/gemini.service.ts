import { GoogleGenerativeAI } from '@google/generative-ai';
import { Injectable, Logger } from '@nestjs/common';
import { envConfig } from 'src/config/env.config';
import { Socket } from 'socket.io';
import type { ChatPayload } from '../domain/interface/response.interface';
import { ALLOWED_MODELS } from './gemini.constant';
@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private genAI: GoogleGenerativeAI;

  constructor() {
    const GEMINI_API_KEY = envConfig.GEMINI.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not defined in environment variables');
    }
    this.genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    this.logger.log('GoogleGenerativeAI client initialized');
  }

  // Process GEMINI stream and emit to client
  async generateContentStream(
    client: Socket,
    payload: ChatPayload,
  ): Promise<void> {
    const useModel = ALLOWED_MODELS.includes(payload.model)
      ? payload.model
      : envConfig.GEMINI.GEMINI_MODEL;

    const model = this.genAI.getGenerativeModel({
      model: useModel,
    });
    const chat = model.startChat({ history: payload.history || [] });
    this.logger.log(
      `Starting stream for client: ${client.id} using model: ${useModel}`,
    );
    try {
      const result = await chat.sendMessageStream(payload.prompt);

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        if (chunkText) {
          client.emit('new_chunk', { text: chunkText });
        }
      }

      this.logger.log(`Stream completed for client: ${client.id}`);
    } catch (error) {
      this.logger.error(
        `Error during Gemini stream for client ${client.id}`,
        error,
      );
      client.emit('stream_error', {
        message: 'An error occurred while processing your request.',
      });
    } finally {
      client.emit('stream_end');
      this.logger.log(`Stream ended for client: ${client.id}`);
    }
  }
}
