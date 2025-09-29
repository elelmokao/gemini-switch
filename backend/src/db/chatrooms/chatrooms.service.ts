import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chatrooms } from './chatrooms.entity';
import { CreateChatroomsDto } from './dto/create_chatrooms.dto';

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

  async remove(id: string): Promise<void> {
    await this.chatroomsRepository.delete(id);
  }
}
