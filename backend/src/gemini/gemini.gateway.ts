import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { GeminiService } from './application/gemini.service';
import { PersonaChatService } from './application/persona-chat.service';
import type { ChatPayload } from './domain/interface/response.interface';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class GeminiGateway {
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger(GeminiGateway.name);

  constructor(
    private readonly geminiService: GeminiService,
    private readonly personaChatService: PersonaChatService,
  ) {}

  @SubscribeMessage('chat')
  async handleMessage(
    @MessageBody() payload: ChatPayload,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    this.logger.log(`Received message from ${client.id}: ${payload.prompt}`);
    this.logger.log(
      `Mentioned persona IDs: ${payload.mentioned_persona_ids?.length || 0}`,
    );

    try {
      // Process persona mentions and enhance payload
      const { enhancedPayload, personaIds } =
        await this.personaChatService.processPersonaMentions(payload);

      if (personaIds.length > 0) {
        this.logger.log(
          `✓ Personas applied: ${personaIds.join(', ')} for client: ${client.id}`,
        );
      } else {
        this.logger.log(`No personas used for client: ${client.id}`);
      }

      // Call GeminiService to process stream with enhanced payload
      await this.geminiService.generateContentStream(client, enhancedPayload);
    } catch (err: any) {
      this.logger.error(
        `Error in handleMessage: ${err?.message}`,
        err?.stack,
      );
      client.emit('stream_error', {
        message: 'Internal server error occurred.',
      });
    }
  }

  @SubscribeMessage('test')
  handleTestMessage(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ): void {
    client.emit('test_response', {
      message: 'Test event received successfully!',
    });
  }
}
