export interface RecommendationItem {
  sku: number;
  score: number;
}

export interface RecommendationMethod {
  strategy: string;
  weight: number;
}

export interface RecommendationConfig {
  id: number;
  target_context?: string;
  personal_methods: RecommendationMethod[];
  isActive: boolean;
}

export type StrategyDataMap = Record<
  string,
  Record<number, RecommendationItem[]>
>;

export interface RecommendationInput {
  user_id: number;
  recommended_skus: RecommendationItem[];
  setting_id: number;
  generated_at?: Date;
}

export type PythonPersonalResults = Record<
  string,
  Record<number, RecommendationItem[]>
>;

export type PythonGlobalResults = Record<string, RecommendationItem[]>;

export enum UserRole {
  CUSTOMER = 'customer',
  ADMIN = 'admin',
  MANAGER = 'manager',
}
