import { Injectable } from '@nestjs/common';
import { StrategyScope } from 'src/common/enum/StrategyScope.enum';
import { TPersonalStrategyResult } from 'src/common/type/StrategyResult.type';
import { BaseGenerateStrategy } from 'src/common/abstract/baseStrategy.abstract';

@Injectable()
export class ItemBasedCollabStrategy extends BaseGenerateStrategy<TPersonalStrategyResult> {
  readonly name = 'collab_item-based';
  readonly description =
    'Коллаборативная фильтрация item-based. Стоит использовать, если пользователей больше, чем товаров';
  readonly scope = StrategyScope.PERSONAL;
  protected readonly scriptName = 'collab.item-based.strategy.py';
}
