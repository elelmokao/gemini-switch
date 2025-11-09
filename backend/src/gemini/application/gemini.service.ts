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
  private defaultApiKey: string;

  constructor() {
    this.defaultApiKey = envConfig.GEMINI.GEMINI_API_KEY;
    if (!this.defaultApiKey) {
      throw new Error('GEMINI_API_KEY is not defined in environment variables');
    }
    this.genAI = new GoogleGenerativeAI(this.defaultApiKey);
    this.logger.log(
      'GoogleGenerativeAI client initialized with default API key',
    );
  }

  // Process GEMINI stream and emit to client
  async generateContentStream(
    client: Socket,
    payload: ChatPayload,
  ): Promise<void> {
    // Determine which model to use: persona's model > payload model > default
    const useModel = payload.persona_model
      ? payload.persona_model
      : ALLOWED_MODELS.includes(payload.model)
        ? payload.model
        : envConfig.GEMINI.GEMINI_MODEL;

    // Use provided API key or fall back to default
    const apiKey = payload.api_key || this.defaultApiKey;
    this.logger.log(
      `Using API key: ${apiKey.substring(0, 10)}... for client: ${client.id}`,
    );

    const genAI = new GoogleGenerativeAI(apiKey);

    // Build model configuration with proper typing
    const modelConfig: {
      model: string;
      systemInstruction?: string;
    } = {
      model: useModel,
    };

    // Add system instruction if provided by persona
    if (payload.system_instruction) {
      modelConfig.systemInstruction = payload.system_instruction;
      this.logger.log(
        `[SYSTEM INSTRUCTION] Using persona system instruction for client: ${client.id}`,
      );
      this.logger.log(
        `[SYSTEM INSTRUCTION] Content: ${payload.system_instruction.substring(0, 150)}...`,
      );
    } else {
      this.logger.log(
        `[SYSTEM INSTRUCTION] No system instruction provided for client: ${client.id}`,
      );
    }

    const model = genAI.getGenerativeModel(modelConfig);
    const chat = model.startChat({ history: payload.history || [] });

    this.logger.log(
      `Starting stream for client: ${client.id} using model: ${useModel}${payload.system_instruction ? ' WITH PERSONA SYSTEM INSTRUCTION ✓' : ' (no system instruction)'}`,
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
