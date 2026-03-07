import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

export enum UserEventType {
  VIEW = 'view',
  ADD_TO_CART = 'add_to_cart',
  PURCHASE = 'purchase',
}

@Entity('user_events')
@Index(['user_id', 'product_id', 'timestamp'])
export class UserEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column()
  product_id: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;

  @Column({
    type: 'enum',
    enum: UserEventType,
    default: UserEventType.VIEW,
  })
  event_type: UserEventType;
}
