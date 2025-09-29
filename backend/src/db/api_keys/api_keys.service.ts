import { Logger } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiKey } from './api_key.entity';
import { CreateApiKeysDto } from './dto/create_api_keys.dto';

@Injectable()
export class ApiKeysService {
  private readonly logger = new Logger(ApiKeysService.name);
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
    try {
      const apiKey = await this.apiKeysRepository.findOneBy({
        api_key: api_key,
      });
      return apiKey;
    } catch (error) {
      this.logger.error('Error fetching API key:', error);
      return null;
    }
  }

  async deleteApiKey(api_key: string): Promise<void> {
    await this.apiKeysRepository.delete({ api_key: api_key });
  }
}
