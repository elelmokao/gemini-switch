import { Test, TestingModule } from '@nestjs/testing';
import { ChatroomMessagesController } from './chatroom_messages.controller';

describe('ChatroomMessagesController', () => {
  let controller: ChatroomMessagesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatroomMessagesController],
    }).compile();

    controller = module.get<ChatroomMessagesController>(
      ChatroomMessagesController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
