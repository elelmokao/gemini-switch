import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chatrooms } from './chatrooms.entity';
import { CreateChatroomsDto } from './dto/create_chatrooms.dto';
import { UpdateChatroomsDto } from './dto/update_chatrooms.dto';

@Injectable()
export class ChatroomsService {
  constructor(
    @InjectRepository(Chatrooms)
    private chatroomsRepository: Repository<Chatrooms>,
  ) {}

  async create(createChatroomsDto: CreateChatroomsDto): Promise<Chatrooms> {
    const newChatroom = this.chatroomsRepository.create(createChatroomsDto);
    return this.chatroomsRepository.save(newChatroom);
  }

  async findAll(): Promise<Chatrooms[]> {
    return this.chatroomsRepository.find();
  }

  async findOne(id: string): Promise<Chatrooms | null> {
    return this.chatroomsRepository.findOneBy({ id });
  }

  async update(
    id: string,
    updateChatroomsDto: UpdateChatroomsDto,
  ): Promise<Chatrooms | null> {
    await this.chatroomsRepository.update(id, updateChatroomsDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.chatroomsRepository.delete(id);
  }
}
