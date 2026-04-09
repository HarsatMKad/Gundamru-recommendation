import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { IRecommendationItem } from 'src/common/interface/recommendation.interface';

@Entity('recommender_setting')
export class RecommendationSetting {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true, nullable: false })
  name!: string;

  @Column({ type: 'jsonb' })
  personal_methods!: { strategy: string; weight: number }[];

  @Column({ default: true, nullable: false })
  isActive!: boolean;

  @Column({ nullable: true })
  fallback_strategy?: string;

  @Column({ type: 'float', default: 1 })
  fallback_weight!: number;

  @Column({ type: 'jsonb', nullable: true })
  fallback_skus?: IRecommendationItem[];

  @Column({ type: 'timestamp', nullable: true })
  fallback_updated_at?: Date;
}
