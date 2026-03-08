import { Entity, PrimaryColumn, Column, Index } from 'typeorm';

export interface RecommendationItem {
  sku: number;
  score: number;
}

export enum TargetContextType {
  HOME = 'homepage',
  PRODUCT = 'product_page',
}

@Entity('user_recommendations')
@Index(['user_id', 'target_context'], { unique: true })
export class Recommendation {
  @PrimaryColumn()
  user_id: number;

  @Column({
    type: 'jsonb',
    default: () => "'[]'",
  })
  recommendde_skus: RecommendationItem[];

  @Column({
    type: 'enum',
    enum: TargetContextType,
    default: TargetContextType.HOME,
  })
  target_context: TargetContextType;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  generated_at: Date;
}
