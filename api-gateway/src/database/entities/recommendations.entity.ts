import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { RecommendationSetting } from 'src/database/entities/recommendation-settings.entity';
import { IRecommendationItem } from 'src/common/interface/recommendation.interface';

@Entity('user_recommendation')
export class Recommendation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  userId!: string;

  @Column('uuid')
  settingId!: string;

  @ManyToOne(() => RecommendationSetting)
  @JoinColumn({ name: 'setting_id' })
  setting!: RecommendationSetting;

  @Column({
    type: 'jsonb',
    default: () => "'[]'",
  })
  recommendedSkus!: IRecommendationItem[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  generatedAt!: Date;
}
