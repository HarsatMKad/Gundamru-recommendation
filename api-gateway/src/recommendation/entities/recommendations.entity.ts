import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { RecommenderSetting } from 'src/recommendation-settings/entities/settings.entity';
import { RecommendationItem } from 'src/common/interface/recommendation.interface';

@Entity('user_recommendation')
@Index(['user_id', 'setting_id'], { unique: true })
export class Recommendation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  user_id: string;

  @Column('uuid')
  setting_id: string;

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
