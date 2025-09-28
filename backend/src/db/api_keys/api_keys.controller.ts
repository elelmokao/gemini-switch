import { Controller, Get, Post, Body, Logger, Delete } from '@nestjs/common';
import { ApiKeysService } from './api_keys.service';
import { ApiKey } from './api_key.entity';
import type { CreateApiKeysDto } from './dto/create_api_keys.dto';

@Controller('api_keys')
export class ApiKeysController {
  private logger: Logger = new Logger(ApiKeysController.name);
  constructor(private readonly apiKeysService: ApiKeysService) {}

  // POST /api-keys
  @Post()
  create(@Body() createApiKeyDto: CreateApiKeysDto): Promise<ApiKey> {
    this.logger.log(`Creating API key.`);
    const fullDto = { ...createApiKeyDto, token_used: 0 };
    return this.apiKeysService.createApiKey(fullDto);
  }

  // GET /api-keys
  @Get()
  findAll(): Promise<ApiKey[]> {
    this.logger.log(`Getting API key.`);
    return this.apiKeysService.getAllApiKeys();
  }

  // GET /api-keys/:api_key
  @Get()
  findByApiKey(@Body() body: { api_key: string }): Promise<ApiKey | null> {
    const { api_key } = body;
    this.logger.log(`Getting API key by api_key: ${api_key}`);
    return this.apiKeysService.getApiKeyByApiKey(api_key);
  }

  // DELETE /api-keys
  @Delete()
  delete(@Body() body: { api_key: string }): Promise<void> {
    const { api_key } = body;
    this.logger.log(`Deleting API key with id: ${api_key}`);
    return this.apiKeysService.deleteApiKey(api_key);
  }
}
