import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('event_type')
export class EventType {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  name!: string;

  @Column({ type: 'float', default: 1 })
  weight!: number;

  @Column({ type: 'int', default: 30 })
  retention_days!: number;

  @Column({ type: 'int', default: 50 })
  max_for_user!: number;

  @Column({ default: true })
  is_active!: boolean;
}
