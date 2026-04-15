import { Injectable } from '@nestjs/common';
import { StrategyScope } from 'src/common/enum/StrategyScope.enum';
import { IPersonalStrategy } from 'src/common/interface/strategies.interface';

@Injectable()
export class UserBasedCollabStrategy implements IPersonalStrategy {
  readonly name = 'collab_user_based';
  readonly description =
    'Коллаборативная фильтрация user-based. Стоит использовать, если товаров больше, чем пользователей';
  readonly scope = StrategyScope.PERSONAL;
}

@Injectable()
export class ContentBasedStrategy implements IPersonalStrategy {
  readonly name = 'content_based';
  readonly description =
    'Подбор на основании похожести характеристик товаров, с которыми взаимодейстовал пользователь. Подходит когда мало событий, но тратит больше времени на генерацию';
  readonly scope = StrategyScope.PERSONAL;
}
