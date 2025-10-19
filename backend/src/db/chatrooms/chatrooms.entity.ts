import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ChatroomEnrolledPersona } from '../chatroom_enrolled_personas/chatroom_enrolled_personas.entity';

@Entity('chatrooms')
export class Chatrooms {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  user_id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column('uuid', { array: true, nullable: true })
  persona_ids: string[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(
    () => ChatroomEnrolledPersona,
    (enrolledPersona) => enrolledPersona.chatroom,
  )
  enrolledPersonas: ChatroomEnrolledPersona[];
}
