import { RecommenderSetting } from 'src/recommendation-settings/entities/settings.entity';
import { UserEvent } from 'src/user-events/entities/user-event.entity';
import { User } from 'src/users/entities/user.entity';

export interface RecommendationItem {
  sku: string;
  score: number;
}

export interface RecommendationMethod {
  strategy: string;
  weight: number;
}

export interface RecommendationConfig {
  id: string;
  target_context?: string;
  personal_methods: RecommendationMethod[];
  isActive: boolean;
}

export type StrategyDataMap = Record<
  string,
  Record<number, RecommendationItem[]>
>;

export interface RecommendationInput {
  user_id: string;
  recommended_skus: RecommendationItem[];
  setting_id: string;
  generated_at?: Date;
}

export enum UserRole {
  CUSTOMER = 'customer',
  ADMIN = 'admin',
  MANAGER = 'manager',
}

export interface RecommendationData {
  users: User[];
  userEvents: UserEvent[];
}

export interface ValidationData {
  validUserIds: string[];
  activeConfigs: RecommenderSetting[];
  inactiveRecIds: string[];
}
