import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { FallbackRecommendation } from 'src/fallback-recommendation/entities/fallback-recommendation.entity';

@Entity('recommender_settings')
export class RecommenderSetting {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: false })
  target_context: string;

  @Column({ type: 'jsonb' })
  methods: { strategy: string; weight: number }[];

  @Column({ default: true, nullable: false })
  isActive: boolean;

  @Column({ default: false })
  is_default: boolean;

  @Column({ nullable: true })
  fallback_rec_id?: number;

  @ManyToOne(() => FallbackRecommendation, { nullable: true })
  @JoinColumn({ name: 'fallback_rec_id' })
  fallbackRec?: FallbackRecommendation;

  @BeforeInsert()
  @BeforeUpdate()
  validateDefaultAndFallback() {
    if (this.is_default && this.fallback_rec_id) {
      throw new Error(
        'Стандартная настройка не может иметь fallback рекомендации',
      );
    }
  }
}
