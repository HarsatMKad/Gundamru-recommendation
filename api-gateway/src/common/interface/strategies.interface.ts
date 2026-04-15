import { StrategyScope } from '../enum/StrategyScope.enum';

export interface IStrategyDefinition {
  name: string;
  description: string;
  scope: StrategyScope;
}

export interface IBaseRectrategy {
  readonly name: string;
  readonly description: string;
  readonly scope: StrategyScope;
}

export interface IPersonalStrategy extends IBaseRectrategy {
  readonly scope: StrategyScope.PERSONAL;
}

export interface IGlobalStrategy extends IBaseRectrategy {
  readonly scope: StrategyScope.GLOBAL;
}

export interface Ipayload {
  events?: Array<{
    user_id: string;
    product_id: string;
    weight: number;
    count: number;
    timestamp: number;
    retention_days: number;
  }>;
  products?: Array<{
    id: string;
    brand_id: string;
    grade: string;
    scale: string;
    price: number;
  }>;
  rec_length: number;
}
