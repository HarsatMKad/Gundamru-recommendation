import { Entity, PrimaryColumn, Column } from 'typeorm';

export interface RecommendationItem {
  sku: number;
  score: number;
}

export enum TargetContextType {
  HOME = 'homepage',
  PRODUCT = 'product_page',
}

@Entity('user_recommendations')
export class UserRecommendation {
  @PrimaryColumn()
  userId: number;

  @Column({
    type: 'jsonb',
    default: () => "'[]'",
  })
  recommended_skus: RecommendationItem[];

  @Column({
    type: 'enum',
    enum: TargetContextType,
    default: TargetContextType.HOME,
  })
  targetContext: TargetContextType;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  generatedAt: Date;
}
