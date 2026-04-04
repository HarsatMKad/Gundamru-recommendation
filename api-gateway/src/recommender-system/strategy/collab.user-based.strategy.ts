import { Injectable } from '@nestjs/common';
import { StrategyScope } from 'src/common/enum/StrategyScope.enum';
import { TPersonalStrategyResult } from 'src/common/type/StrategyResult.type';
import { BaseGenerateStrategy } from 'src/common/abstract/baseStrategy.abstract';

@Injectable()
export class UserBasedCollabStrategy extends BaseGenerateStrategy<TPersonalStrategyResult> {
  readonly name = 'collab_user-based';
  readonly description =
    'Коллаборативная фильтрация user-based. Стоит использовать, если товаров больше, чем пользователей';
  readonly scope = StrategyScope.PERSONAL;
  protected readonly scriptName = 'collab.user-based.strategy.py';
}
