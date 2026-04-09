import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { EventType } from './event-types.entity';
import { User } from './user.entity';
import { Product } from './product.entity';

@Entity('user_event')
@Unique('UQ_user_product_event', ['user_id', 'product_id', 'event_type_id'])
@Index('IDX_user_product_event_type_timestamp', [
  'user_id',
  'product_id',
  'event_type_id',
  'timestamp',
])
@Index('IDX_event_type_user_timestamp', [
  'event_type_id',
  'user_id',
  'timestamp',
])
@Index('IDX_user_event_type_timestamp', [
  'user_id',
  'event_type_id',
  'timestamp',
])
export class UserEvent {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  user_id!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column('uuid')
  product_id!: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product!: Product;

  @Column('uuid')
  event_type_id!: string;

  @ManyToOne(() => EventType)
  @JoinColumn({ name: 'event_type_id' })
  eventType!: EventType;

  @Column({ type: 'int', default: 1 })
  count!: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp!: Date;
}
