import { Module } from '@nestjs/common';
import { ChatroomMessagesService } from './chatroom_messages.service';
import { ChatroomMessagesController } from './chatroom_messages.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatroomMessages } from './chatroom_messages.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ChatroomMessages])],
  providers: [ChatroomMessagesService],
  exports: [ChatroomMessagesService],
  controllers: [ChatroomMessagesController],
})
export class ChatroomMessagesModule {}
