import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { RecommenderSetting } from 'src/recommendation-settings/entities/settings.entity';

export interface RecommendationItem {
  sku: number;
  score: number;
}

@Entity('user_recommendations')
@Index(['user_id', 'setting_id'], { unique: true })
export class Recommendation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column()
  setting_id: number;

  @ManyToOne(() => RecommenderSetting)
  @JoinColumn({ name: 'setting_id' })
  setting: RecommenderSetting;

  @Column({
    type: 'jsonb',
    default: () => "'[]'",
  })
  recommended_skus: RecommendationItem[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  generated_at: Date;
}
