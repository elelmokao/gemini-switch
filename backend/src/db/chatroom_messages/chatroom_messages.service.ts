import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatroomMessages } from './chatroom_messages.entity';
import { Repository } from 'typeorm';
import { ChatroomMessagesDto } from './dto/create_chatroom_messages.dto';

@Injectable()
export class ChatroomMessagesService {
  constructor(
    @InjectRepository(ChatroomMessages)
    private chatroomRespository: Repository<ChatroomMessages>,
  ) {}

  async createMessage(
    chatroomMessagesDto: ChatroomMessagesDto,
  ): Promise<ChatroomMessages> {
    const newMessage = this.chatroomRespository.create({
      ...chatroomMessagesDto,
      chatroom_id: chatroomMessagesDto.chatroom_id
        ? { id: chatroomMessagesDto.chatroom_id }
        : undefined,
      persona_id: chatroomMessagesDto.persona_id
        ? { id: chatroomMessagesDto.persona_id }
        : undefined,
    });
    return this.chatroomRespository.save(newMessage);
  }

  async getMessagesByChatroomId(
    chatroomId: string,
  ): Promise<ChatroomMessages[]> {
    return this.chatroomRespository.find({
      where: { chatroom_id: { id: chatroomId } },
      order: { created_at: 'ASC' },
    });
  }
}
