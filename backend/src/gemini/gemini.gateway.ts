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
import type { ChatPayload } from './domain/interface/response.interface';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class GeminiGateway {
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger(GeminiGateway.name);

  constructor(private readonly geminiService: GeminiService) {}

  @SubscribeMessage('chat')
  handleMessage(
    @MessageBody() payload: ChatPayload,
    @ConnectedSocket() client: Socket,
  ): void {
    this.logger.log(`Received message from ${client.id}: ${payload.prompt}`);

    // IMPORTANT: Call GeminiService to process stream.
    this.geminiService
      .generateContentStream(client, payload)
      .catch((err: Error) => {
        this.logger.error(
          `Error in generateContentStream: ${err?.message}`,
          err?.stack,
        );
        client.emit('stream_error', {
          message: 'Internal server error occurred.',
        });
      });
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
