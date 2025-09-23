import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiKeysService } from './api_keys.service';
import { ApiKey } from './api_key.entity';
import type { CreateApiKeysDto } from './dto/create_api_keys.dto';

@Controller('api_keys')
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  // POST /api-keys
  @Post()
  create(@Body() createApiKeyDto: CreateApiKeysDto): Promise<ApiKey> {
    const fullDto = { ...createApiKeyDto, token_used: 0 };
    return this.apiKeysService.createApiKey(fullDto);
  }

  // GET /api-keys
  @Get()
  findAll(): Promise<ApiKey[]> {
    return this.apiKeysService.getAllApiKeys();
  }
}
