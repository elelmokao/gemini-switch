import { Controller, Delete, Get, Post, Body } from '@nestjs/common';
import { ChatroomsService } from './chatrooms.service';
import type { CreateChatroomsDto } from './dto/create_chatrooms.dto';

@Controller('chatrooms')
export class ChatroomsController {
  constructor(private readonly chatroomsService: ChatroomsService) {}

  @Post()
  create(@Body() createChatroomsDto: CreateChatroomsDto) {
    return this.chatroomsService.create(createChatroomsDto);
  }

  @Get()
  findAll() {
    return this.chatroomsService.findAll();
  }

  @Get(':id')
  findOne(id: string) {
    return this.chatroomsService.findOne(id);
  }

  @Delete(':id')
  remove(id: string) {
    return this.chatroomsService.remove(id);
  }
}
