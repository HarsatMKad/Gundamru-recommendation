import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { IRecommendationItem } from 'src/common/interface/recommendation.interface';

@Entity('recommender_setting')
export class RecommendationSetting {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ nullable: false })
  name!: string;

  @Column({ unique: true, nullable: false })
  type!: string;

  @Column({ type: 'jsonb' })
  personalMethods!: { strategy: string; weight: number }[];

  @Column({ default: true, nullable: false })
  isActive!: boolean;

  @Column({ nullable: true })
  fallbackStrategy?: string;

  @Column({ type: 'float', default: 1 })
  fallbackWeight!: number;

  @Column({ type: 'jsonb', nullable: true })
  fallbackSkus?: IRecommendationItem[];

  @Column({ type: 'timestamp', nullable: true })
  fallbackUpdatedAt?: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;
}
