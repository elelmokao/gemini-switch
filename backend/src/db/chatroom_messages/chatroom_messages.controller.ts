import { Body, Controller, Get, Post } from '@nestjs/common';
import { ChatroomMessagesService } from './chatroom_messages.service';
import type { ChatroomMessagesDto } from './dto/create_chatroom_messages.dto';

@Controller('chatroom-messages')
export class ChatroomMessagesController {
  constructor(
    private readonly chatroomMessagesService: ChatroomMessagesService,
  ) {}

  @Post()
  create(@Body() chatroomMessagesDto: ChatroomMessagesDto) {
    return this.chatroomMessagesService.createMessage(chatroomMessagesDto);
  }

  @Get(':chatroomId')
  getMessagesByChatroomId(chatroomId: string) {
    return this.chatroomMessagesService.getMessagesByChatroomId(chatroomId);
  }
}
