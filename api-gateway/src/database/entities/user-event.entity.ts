import { Entity, PrimaryGeneratedColumn, Column, Index, Unique } from 'typeorm';
import { UserEventNames } from 'src/common/enum/UserEventName.enum';
import { UserEventType } from 'src/common/class/UserEventType.class';

@Entity('user_event')
@Unique('UQ_user_product_event', ['user_id', 'product_id', 'event_type_name'])
@Index('IDX_user_product_event', ['user_id', 'product_id', 'event_type_name']) // Для поиска уникальных записей при создании
@Index('IDX_event_timestamp', ['event_type_name', 'timestamp']) // Для удаления старых записей
export class UserEvent {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  user_id!: string;

  @Column('uuid')
  product_id!: string;

  @Column({ type: 'enum', enum: UserEventNames, default: UserEventNames.VIEW })
  event_type_name!: UserEventNames;

  @Column({ type: 'int', default: 1 })
  count!: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp!: Date;

  get config() {
    return UserEventType.getConfig(this.event_type_name);
  }

  get weight(): number {
    return this.config.weight;
  }

  get retentionDays(): number {
    return this.config.retentionDays;
  }
}
