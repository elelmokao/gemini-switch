import { Module } from '@nestjs/common';
import { ChatroomsService } from './chatrooms.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chatrooms } from './chatrooms.entity';
import { ChatroomsController } from './chatrooms.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Chatrooms])],
  providers: [ChatroomsService],
  exports: [ChatroomsService],
  controllers: [ChatroomsController],
})
export class ChatroomsModule {}
