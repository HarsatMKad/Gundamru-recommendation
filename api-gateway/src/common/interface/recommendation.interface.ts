import { RecommendationSetting } from 'src/database/entities/recommendation-settings.entity';
import { UserEvent } from 'src/database/entities/user-event.entity';
import { User } from 'src/database/entities/user.entity';

export interface IRecommendationItem {
  sku: string;
  score: number;
}

export interface IRecommendationMethod {
  strategy: string;
  weight: number;
}

export interface IRecommendationConfig {
  id: string;
  target_context?: string;
  personal_methods: IRecommendationMethod[];
  isActive: boolean;
}

export interface IRecommendationInput {
  user_id: string;
  recommended_skus: IRecommendationItem[];
  setting_id: string;
  generated_at?: Date;
}

export interface IRecommendationData {
  users: User[];
  userEvents: UserEvent[];
}

export interface IValidationData {
  validUserIds: string[];
  activeConfigs: RecommendationSetting[];
  inactiveRecIds: string[];
}
