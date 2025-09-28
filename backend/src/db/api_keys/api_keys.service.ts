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

  async getApiKeyByApiKey(api_key: string): Promise<ApiKey | null> {
    return this.apiKeysRepository.findOneBy({ api_key: api_key });
  }

  async deleteApiKey(api_key: string): Promise<void> {
    await this.apiKeysRepository.delete({ api_key: api_key });
  }
}
