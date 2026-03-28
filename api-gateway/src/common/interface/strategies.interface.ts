import { UserEvent } from 'src/user-events/entities/user-event.entity';
import { RecommendationItem } from './recommendation.interface';

export enum StrategyScope {
  PERSONAL = 'personal',
  GLOBAL = 'global',
}

export interface StrategyDefinition {
  name: string;
  description: string;
  scope: StrategyScope;
}

export const AVAILABLE_STRATEGIES: StrategyDefinition[] = [
  {
    name: 'collab',
    description: 'Коллаборативная фильтрация',
    scope: StrategyScope.PERSONAL,
  },
  {
    name: 'popular_global',
    description: 'Тренды недели (глобально)',
    scope: StrategyScope.GLOBAL,
  },
];

export const STRATEGY_NAMES = AVAILABLE_STRATEGIES.map((s) => s.name);
export const STRATEGY_DESCRIPTIONS = AVAILABLE_STRATEGIES.map(
  (s) => s.description,
);

export interface IBaseRectrategy {
  readonly name: string;
  readonly scope: StrategyScope;
}

export interface IPersonalStrategy extends IBaseRectrategy {
  readonly scope: StrategyScope.PERSONAL;
  calculate(
    usersIds: string[],
    userEvents: UserEvent[],
    recLength: number,
  ): PersonalStrategyResult;
}

export type PersonalStrategyResult = Record<string, RecommendationItem[]>;

export interface IGlobalStrategy extends IBaseRectrategy {
  readonly scope: StrategyScope.GLOBAL;
  calculate(userEvents: UserEvent[], recLength: number): RecommendationItem[];
}

export type PersonalResults = Record<string, PersonalStrategyResult>;

export type GlobalResults = Record<string, RecommendationItem[]>;
