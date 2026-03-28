import { UserEvent } from 'src/database/entities/user-event.entity';
import { IRecommendationItem } from './recommendation.interface';
import { StrategyScope } from '../enum/StrategyScope.enum';
import { TPersonalStrategyResult } from '../type/StrategyResult.type';

export interface IStrategyDefinition {
  name: string;
  description: string;
  scope: StrategyScope;
}

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
  ): TPersonalStrategyResult;
}

export interface IGlobalStrategy extends IBaseRectrategy {
  readonly scope: StrategyScope.GLOBAL;
  calculate(userEvents: UserEvent[], recLength: number): IRecommendationItem[];
}
