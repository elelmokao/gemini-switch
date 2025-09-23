import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiKey } from './api_key.entity';
import { CreateApiKeysDto } from './dto/create_api_keys.dto';

@Injectable()
export class ApiKeysService {
  constructor(
    @InjectRepository(ApiKey)
    private apiKeysRepository: Repository<ApiKey>,
  ) {}

  async createApiKey(createApiKeysDto: CreateApiKeysDto): Promise<ApiKey> {
    const newApiKey = this.apiKeysRepository.create(createApiKeysDto);
    return this.apiKeysRepository.save(newApiKey);
  }

  async getAllApiKeys(): Promise<ApiKey[]> {
    return this.apiKeysRepository.find();
  }
}
