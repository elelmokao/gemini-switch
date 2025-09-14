import { Test, TestingModule } from '@nestjs/testing';
import { GeminiGateway } from './gemini.gateway';

describe('GeminiGateway', () => {
  let gateway: GeminiGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GeminiGateway],
    }).compile();

    gateway = module.get<GeminiGateway>(GeminiGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
