import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { EventType } from 'src/event-types/entities/event-types.entity';

@Entity('user_event')
@Index(['user_id', 'product_id', 'timestamp'])
export class UserEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  user_id: string;

  @Column('uuid')
  product_id: string;

  @Column('uuid')
  event_type_id: string;

  @ManyToOne(() => EventType)
  @JoinColumn({ name: 'event_type_id' })
  eventType: EventType;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;
}
