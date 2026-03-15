import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export interface RecommendationItem {
  sku: number;
  score: number;
}

@Entity('fallback_recommendation')
export class FallbackRecommendation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({
    type: 'jsonb',
    default: () => "'[]'",
  })
  recommended_skus: RecommendationItem[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  generated_at: Date;
}
