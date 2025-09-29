import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GeminiModule } from './gemini/gemini.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiKeysModule } from './db/api_keys/api_keys.module';
import { ChatroomsModule } from './db/chatrooms/chatrooms.module';
import { ChatroomMessagesModule } from './db/chatroom_messages/chatroom_messages.module';
import { PersonasModule } from './db/personas/personas.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'user',
      password: 'password',
      database: 'gemini_chat_db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    GeminiModule,
    ApiKeysModule,
    ChatroomsModule,
    ChatroomMessagesModule,
    PersonasModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
