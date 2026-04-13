import { UserEvent } from 'src/database/entities/user-event.entity';
import { IRecommendationItem } from './recommendation.interface';
import { StrategyScope } from '../enum/StrategyScope.enum';
import {
  TPersonalStrategyResult,
  TStrategyCalculateResult,
} from '../type/StrategyResult.type';
import { IProductWithAttributes } from './entites.interface';

export interface IStrategyDefinition {
  name: string;
  description: string;
  scope: StrategyScope;
}

export interface IBaseRectrategy {
  readonly name: string;
  readonly description: string;
  readonly scope: StrategyScope;
  calculate(
    recLength: number,
    userEvents?: UserEvent[],
    products?: IProductWithAttributes[],
  ): TStrategyCalculateResult;
}

export interface IPersonalStrategy extends IBaseRectrategy {
  readonly scope: StrategyScope.PERSONAL;
  calculate(
    recLength: number,
    userEvents?: UserEvent[],
    products?: IProductWithAttributes[],
  ): TPersonalStrategyResult;
}

export interface IGlobalStrategy extends IBaseRectrategy {
  readonly scope: StrategyScope.GLOBAL;
  calculate(
    recLength: number,
    userEvents?: UserEvent[],
    products?: IProductWithAttributes[],
  ): IRecommendationItem[];
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
