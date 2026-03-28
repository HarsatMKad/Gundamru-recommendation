import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { RecommendationSetting } from 'src/database/entities/recommendation-settings.entity';
import { IRecommendationItem } from 'src/common/interface/recommendation.interface';

@Entity('user_recommendation')
@Index(['user_id', 'setting_id'], { unique: true })
export class Recommendation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  user_id: string;

  @Column('uuid')
  setting_id: string;

  @ManyToOne(() => RecommendationSetting)
  @JoinColumn({ name: 'setting_id' })
  setting: RecommendationSetting;

  @Column({
    type: 'jsonb',
    default: () => "'[]'",
  })
  recommended_skus: IRecommendationItem[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  generated_at: Date;
}
