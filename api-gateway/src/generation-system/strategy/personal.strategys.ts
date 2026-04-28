import { Injectable } from '@nestjs/common';
import { StrategyScope } from 'src/common/enum/StrategyScope.enum';
import { IPersonalStrategy } from 'src/common/interface/strategies.interface';

@Injectable()
export class UserBasedCollabStrategy implements IPersonalStrategy {
  readonly name = 'collab_user_based';
  readonly description = `Коллаборативная фильтрация (User-based). Находит пользователей с похожими предпочтениями и рекомендует товары, которые понравились им, а значит понравятся и основному пользователю.`;
  readonly scope = StrategyScope.PERSONAL;
}

@Injectable()
export class ContentBasedStrategy implements IPersonalStrategy {
  readonly name = 'content_based';
  readonly description = `Контентная фильтрация (Content-based). Подбор на основании похожести характеристик товаров, с которыми взаимодейстовал пользователь. Подходит когда мало событий, тратит больше времени на генерацию, чем коллаборативная фильтрация. Используемые характеристики: бренд, грейд, масштаб, цена`;
  readonly scope = StrategyScope.PERSONAL;
}
