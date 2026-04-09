import { Injectable } from '@nestjs/common';
import { StrategyScope } from 'src/common/enum/StrategyScope.enum';
import { TPersonalStrategyResult } from 'src/common/type/StrategyResult.type';
import { BaseGenerateStrategy } from 'src/common/abstract/baseStrategy.abstract';
import { UserEvent } from 'src/database/entities/user-event.entity';
import { Ipayload } from 'src/common/interface/strategies.interface';

@Injectable()
export class ItemBasedCollabStrategy extends BaseGenerateStrategy<TPersonalStrategyResult> {
  readonly name = 'collab_item-based';
  readonly description =
    'Коллаборативная фильтрация item-based. Стоит использовать, если пользователей больше, чем товаров';
  readonly scope = StrategyScope.PERSONAL;
  protected readonly scriptName = 'collab.item-based.strategy.py';

  getPayload(recLength: number, userEvents?: UserEvent[]): Ipayload {
    if (userEvents) {
      return {
        events: userEvents.map((e) => ({
          user_id: e.user_id,
          product_id: e.product_id,
          weight: e.eventType.weight,
          count: e.count,
          timestamp: e.timestamp.getTime(),
          retention_days: e.eventType.retention_days,
        })),
        rec_length: recLength,
      };
    } else {
      return {
        rec_length: recLength,
      };
    }
  }
}
