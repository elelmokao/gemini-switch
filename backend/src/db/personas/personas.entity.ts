import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { UpdateDateColumn } from 'typeorm';
import { ManyToOne, JoinColumn } from 'typeorm';
import { ApiKey } from '../api_keys/api_key.entity';
import { ChatroomEnrolledPersona } from '../chatroom_enrolled_personas/chatroom_enrolled_personas.entity';
@Entity('personas')
export class Personas {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  user_id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text' })
  system_prompt: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  model_used: string;

  @ManyToOne(() => ApiKey, { nullable: false })
  @JoinColumn({ name: 'api_key_id' })
  api_key_id: ApiKey;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(
    () => ChatroomEnrolledPersona,
    (enrolledPersona) => enrolledPersona.persona,
  )
  enrolledChatrooms: ChatroomEnrolledPersona[];
}
