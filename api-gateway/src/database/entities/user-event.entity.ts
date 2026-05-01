import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';
import { UserEventNames } from 'src/common/enum/UserEventName.enum';
import { UserEventType } from 'src/common/class/UserEventType.class';

@Entity('user_event')
@Unique('UQ_user_product_event', ['userId', 'productId', 'eventTypeName'])
export class UserEvent {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  userId!: string;

  @Column('uuid')
  productId!: string;

  @Column({ type: 'enum', enum: UserEventNames, default: UserEventNames.VIEW })
  eventTypeName!: UserEventNames;

  @Column({ type: 'int', default: 1 })
  count!: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp!: Date;

  get config() {
    return UserEventType.getConfig(this.eventTypeName);
  }

  get weight(): number {
    return this.config.weight;
  }

  get retentionDays(): number {
    return this.config.retentionDays;
  }
}
