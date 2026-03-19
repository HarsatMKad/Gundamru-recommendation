export enum StrategyScope {
  PERSONAL = 'personal',
  GLOBAL = 'global',
}

export interface StrategyDefinition {
  name: string;
  description: string;
  scope: StrategyScope;
  calculate_endpoint: string;
}

export const AVAILABLE_STRATEGIES: StrategyDefinition[] = [
  {
    name: 'collab',
    description: 'Коллаборативная фильтрация',
    scope: StrategyScope.PERSONAL,
    calculate_endpoint: '/calculate/collab',
  },
  {
    name: 'popular',
    description: 'Общая популярность',
    scope: StrategyScope.PERSONAL,
    calculate_endpoint: '/calculate/popular',
  },
  {
    name: 'popular_global',
    description: 'Тренды недели (глобально)',
    scope: StrategyScope.GLOBAL,
    calculate_endpoint: '/calculate-global/popular_global',
  },
];

export const STRATEGY_NAMES = AVAILABLE_STRATEGIES.map((s) => s.name);
export const STRATEGY_DESCRIPTIONS = AVAILABLE_STRATEGIES.map(
  (s) => s.description,
);
