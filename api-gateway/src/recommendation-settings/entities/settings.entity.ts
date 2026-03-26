import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { RecommendationItem } from 'src/common/interface/recommendation.interface';

@Entity('recommender_setting')
export class RecommenderSetting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: false })
  target_context: string;

  @Column({ type: 'jsonb' })
  personal_methods: { strategy: string; weight: number }[];

  @Column({ default: true, nullable: false })
  isActive: boolean;

  @Column({ nullable: true })
  fallback_strategy?: string;

  @Column({ type: 'float', nullable: true })
  fallback_weight?: number;

  @Column({ type: 'jsonb', nullable: true })
  fallback_skus?: RecommendationItem[];

  @Column({ type: 'timestamp', nullable: true })
  fallback_updated_at?: Date;
}
