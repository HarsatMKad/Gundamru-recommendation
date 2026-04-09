import { Injectable } from '@nestjs/common';
import { StrategyScope } from 'src/common/enum/StrategyScope.enum';
import { TPersonalStrategyResult } from 'src/common/type/StrategyResult.type';
import { BaseGenerateStrategy } from 'src/common/abstract/baseStrategy.abstract';
import { UserEvent } from 'src/database/entities/user-event.entity';
import { Ipayload } from 'src/common/interface/strategies.interface';

@Injectable()
export class UserBasedCollabStrategy extends BaseGenerateStrategy<TPersonalStrategyResult> {
  readonly name = 'collab_user-based';
  readonly description =
    'Коллаборативная фильтрация user-based. Стоит использовать, если товаров больше, чем пользователей';
  readonly scope = StrategyScope.PERSONAL;
  protected readonly scriptName = 'collab.user-based.strategy.py';

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
