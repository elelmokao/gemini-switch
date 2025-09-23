import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('api_keys')
export class ApiKey {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  user_id: string;

  @Column({ type: 'varchar', length: 255 })
  api_key: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: 0 })
  token_used: number;

  @CreateDateColumn()
  created_at: Date;
}
