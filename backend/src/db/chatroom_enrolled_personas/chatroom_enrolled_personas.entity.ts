import {
  Entity,
  PrimaryColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Chatrooms } from '../chatrooms/chatrooms.entity';
import { Personas } from '../personas/personas.entity';

@Entity('chatroom_enrolled_personas')
export class ChatroomEnrolledPersona {
  @PrimaryColumn({ type: 'uuid' })
  chatroom_id: string;

  @PrimaryColumn({ type: 'uuid' })
  persona_id: string;

  @ManyToOne(() => Chatrooms, (chatroom) => chatroom.enrolledPersonas, {
    onDelete: 'CASCADE', // 當聊天室被刪除時，相關的啟用紀錄也一併刪除
  })
  @JoinColumn({ name: 'chatroom_id' }) // 明確指定外鍵欄位名稱
  chatroom: Chatrooms;

  @ManyToOne(() => Personas, (persona) => persona.enrolledChatrooms, {
    onDelete: 'CASCADE', // 當 Persona 被刪除時，相關的啟用紀錄也一併刪除
  })
  @JoinColumn({ name: 'persona_id' }) // 明確指定外鍵欄位名稱
  persona: Personas;

  @CreateDateColumn()
  enrolled_at: Date;
}
