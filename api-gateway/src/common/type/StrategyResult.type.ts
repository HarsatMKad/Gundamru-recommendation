import {
  IRecommendationItem,
  IStrategyResultItem,
} from '../interface/recommendation.interface';

export type TPersonalStrategyResult = Record<string, IStrategyResultItem[]>;

export type TPersonalResults = Record<string, TPersonalStrategyResult>;

export type TGlobalResults = Record<string, IRecommendationItem[]>;

export type TStrategyResult = TPersonalStrategyResult | IRecommendationItem[];
