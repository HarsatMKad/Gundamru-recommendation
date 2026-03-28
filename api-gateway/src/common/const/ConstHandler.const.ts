import { IStrategyDefinition } from '../interface/strategies.interface';
import { StrategyScope } from '../enum/StrategyScope.enum';

export const CACH_CONST = {
  CACHEKEY_PERSONAL: 'rec-personal',
  CACHEKEY_FALLBACK: 'rec-fallback',
};

export const RECOMMENDATION_MODS = {
  PERSONAL: 'personal',
  FALLBACK: 'fallback',
  MIXED: 'mixed',
  MIXED_FULLFALLBACK: 'mixed-fullfallback',
};

export const AVAILABLE_STRATEGIES: IStrategyDefinition[] = [
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
export const API_KEY_HEADER = 'x-api-key';
