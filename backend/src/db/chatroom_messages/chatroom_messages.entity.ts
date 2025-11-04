import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Chatrooms } from '../chatrooms/chatrooms.entity';
import { Personas } from '../personas/personas.entity';

@Entity('chatroom_messages')
export class ChatroomMessages {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Chatrooms, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'chatroom_id' })
  chatroom_id: Chatrooms;

  @Column({ type: 'varchar', length: 20, nullable: false })
  role: string;

  @Column({ type: 'text', nullable: false })
  content: string;

  @ManyToOne(() => Personas, { nullable: true })
  @JoinColumn({ name: 'persona_id' })
  persona_id: Personas | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
