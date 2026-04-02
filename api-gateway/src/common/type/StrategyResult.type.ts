import { IRecommendationItem } from '../interface/recommendation.interface';

export type TPersonalStrategyResult = Record<string, IRecommendationItem[]>;

export type TPersonalResults = Record<string, TPersonalStrategyResult>;

export type TGlobalResults = Record<string, IRecommendationItem[]>;

export type TStrategyResult = TPersonalStrategyResult | IRecommendationItem[];
