import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ManyToOne, JoinColumn } from 'typeorm';
import { Personas } from '../personas/personas.entity';
import { ChatroomEnrolledPersona } from '../chatroom_enrolled_personas/chatroom_enrolled_personas.entity';

@Entity('chatrooms')
export class Chatrooms {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  user_id: string;

  @Column({ type: 'varchar', length: 255, default: 'New Chat' })
  title: string;

  @ManyToOne(() => Personas, { nullable: false })
  @JoinColumn({ name: 'base_personal_id' })
  base_persona_id: string;

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
