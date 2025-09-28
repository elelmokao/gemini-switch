import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiKeysService } from './api_keys.service';
import { CreateApiKeysDto } from './dto/create_api_keys.dto';
import { ApiKey } from './api_key.entity';

// A fake Repository object to define jest mock functions
const mockApiKeysRepository = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOneBy: jest.fn(),
  delete: jest.fn(),
};

describe('ApiKeysService', () => {
  let service: ApiKeysService;
  let repository: Repository<ApiKey>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiKeysService,
        {
          provide: getRepositoryToken(ApiKey),
          useValue: mockApiKeysRepository,
        },
      ],
    }).compile();

    service = module.get<ApiKeysService>(ApiKeysService);
    repository = module.get<Repository<ApiKey>>(getRepositoryToken(ApiKey));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // GET: CreateApiKey Test
  describe('createApiKey', () => {
    it('should successfully create and save a new API key', async () => {
      const createDto: CreateApiKeysDto = {
        user_id: '11111111-1111-1111-1111-111111111111',
        api_key: 'sk-test-key-12345',
        description: 'A test key',
        token_used: 0,
      };

      const createdApiKey = { ...createDto };
      const savedApiKey = {
        id: 'a-uuid-string',
        ...createDto,
        created_at: new Date(),
      };
      mockApiKeysRepository.create.mockReturnValue(createdApiKey);
      mockApiKeysRepository.save.mockResolvedValue(savedApiKey);

      const result = await service.createApiKey(createDto);

      expect(result).toEqual(savedApiKey);

      expect(mockApiKeysRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockApiKeysRepository.create).toHaveBeenCalledTimes(1);

      expect(mockApiKeysRepository.save).toHaveBeenCalledWith(createdApiKey);
      expect(mockApiKeysRepository.save).toHaveBeenCalledTimes(1);
    });
  });

  // GET: getAllApiKeys Test
  describe('getAllApiKeys', () => {
    it('should return an array of API keys', async () => {
      const apiKeysArray: ApiKey[] = [
        {
          id: 'uuid-1',
          user_id: 'user-uuid-1',
          api_key: 'sk-test-key-1',
          description: 'First test key',
          token_used: 0,
          created_at: new Date(),
        },
        {
          id: 'uuid-2',
          user_id: 'user-uuid-2',
          api_key: 'sk-test-key-2',
          description: 'Second test key',
          token_used: 0,
          created_at: new Date(),
        },
      ];

      mockApiKeysRepository.find.mockResolvedValue(apiKeysArray);

      const result = await service.getAllApiKeys();

      expect(result).toEqual(apiKeysArray);
      expect(mockApiKeysRepository.find).toHaveBeenCalledTimes(1);
    });
  });

  // GET: getApiKeyByApiKey Test
  describe('getApiKeyByApiKey', () => {
    it('should return the API key entity when found', async () => {
      const apiKeyString = 'sk-test-key-1';
      const foundApiKey: ApiKey = {
        id: 'uuid-1',
        user_id: 'user-uuid-1',
        api_key: apiKeyString,
        description: 'First test key',
        token_used: 0,
        created_at: new Date(),
      };

      // 設定 mock 物件的行為
      // 當 repository.findOneBy 被呼叫時，回傳一個解析為 foundApiKey 的 Promise
      mockApiKeysRepository.findOneBy.mockResolvedValue(foundApiKey);

      // Act (執行)
      const result = await service.getApiKeyByApiKey(apiKeyString);

      // Assert (斷言)
      expect(result).toEqual(foundApiKey);
      expect(mockApiKeysRepository.findOneBy).toHaveBeenCalledWith({
        api_key: apiKeyString,
      });
      expect(mockApiKeysRepository.findOneBy).toHaveBeenCalledTimes(1);
    });

    it('should return null when the API key is not found', async () => {
      const apiKeyString = 'non-existent-key';

      // 設定 mock 物件的行為
      // 當 repository.findOneBy 被呼叫時，回傳一個解析為 null 的 Promise
      mockApiKeysRepository.findOneBy.mockResolvedValue(null);

      // Act (執行)
      const result = await service.getApiKeyByApiKey(apiKeyString);

      // Assert (斷言)
      expect(result).toBeNull();
      expect(mockApiKeysRepository.findOneBy).toHaveBeenCalledWith({
        api_key: apiKeyString,
      });
      expect(mockApiKeysRepository.findOneBy).toHaveBeenCalledTimes(1);
    });
  });

  // DELETE: deleteApiKey Test
  describe('deleteApiKey', () => {
    it('should successfully delete the API key', async () => {
      const apiKeyString = 'sk-test-key-to-delete';

      // 設定 mock 物件的行為
      // 當 repository.delete 被呼叫時，回傳一個解析為 void 的 Promise
      mockApiKeysRepository.delete.mockResolvedValue(undefined);

      // Act (執行)
      await service.deleteApiKey(apiKeyString);

      // Assert (斷言)
      expect(mockApiKeysRepository.delete).toHaveBeenCalledWith({
        api_key: apiKeyString,
      });
      expect(mockApiKeysRepository.delete).toHaveBeenCalledTimes(1);
    });
  });
});
