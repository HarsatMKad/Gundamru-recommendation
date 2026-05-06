import { RecommendationSetting } from 'src/database/entities/recommendation-settings.entity';
import { UserEvent } from 'src/database/entities/user-event.entity';
import { IProductWithAttributes } from './entites.interface';

export interface IRecommendationItem {
  sku: string;
  score: number;
}

export interface IStrategyResultItem {
  sku: string;
  score: number;
  confidence: number;
}

export interface IRecommendationMethod {
  strategy: string;
  weight: number;
}

export interface IRecommendationInput {
  userId: string;
  recommendedSkus: IRecommendationItem[];
  settingId: string;
  generatedAt?: Date;
}

export interface IValidationData {
  activeConfigs: RecommendationSetting[];
  userEvents: UserEvent[];
  productsWithAttributes: IProductWithAttributes[];
}

export interface IAggregateFallback {
  configId: string;
  fallbacks: IRecommendationItem[];
}
