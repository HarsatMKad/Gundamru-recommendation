import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { EventType } from 'src/event-types/entities/event-types.entity';

@Entity('user_events')
@Index(['user_id', 'product_id', 'timestamp'])
export class UserEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column()
  product_id: number;

  @Column()
  event_type_id: number;

  @ManyToOne(() => EventType)
  @JoinColumn({ name: 'event_type_id' })
  eventType: EventType;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;
}
