import { Test, TestingModule } from '@nestjs/testing';
import { ChatroomMessagesService } from './chatroom_messages.service';

describe('ChatroomMessagesService', () => {
  let service: ChatroomMessagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatroomMessagesService],
    }).compile();

    service = module.get<ChatroomMessagesService>(ChatroomMessagesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
