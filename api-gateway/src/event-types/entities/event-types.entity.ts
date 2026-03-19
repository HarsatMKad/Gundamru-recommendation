import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('event_types')
export class EventType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column('float')
  weight: number;

  @Column({ type: 'int', default: 30 })
  retention_days: number;

  @Column({ default: true })
  is_active: boolean;
}
