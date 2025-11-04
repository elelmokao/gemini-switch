import {
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Body,
  Param,
} from '@nestjs/common';
import { ChatroomsService } from './chatrooms.service';
import type { CreateChatroomsDto } from './dto/create_chatrooms.dto';
import type { UpdateChatroomsDto } from './dto/update_chatrooms.dto';

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
  findOne(@Param('id') id: string) {
    return this.chatroomsService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateChatroomsDto: UpdateChatroomsDto,
  ) {
    return this.chatroomsService.update(id, updateChatroomsDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chatroomsService.remove(id);
  }
}
