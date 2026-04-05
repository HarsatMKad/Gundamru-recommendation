import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('event_type')
export class EventType {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  name!: string;

  @Column('float')
  weight!: number;

  @Column({ type: 'int', default: 30 })
  retention_days!: number;

  @Column({ default: true })
  is_active!: boolean;
}
