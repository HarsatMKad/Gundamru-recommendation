import { IRecommendationItem } from 'src/common/interface/recommendation.interface';
import { IGlobalStrategy } from 'src/common/interface/strategies.interface';
import { UserEvent } from 'src/database/entities/user-event.entity';
import { StrategyScope } from 'src/common/enum/StrategyScope.enum';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GlobalPopularStrategy implements IGlobalStrategy {
  readonly name = 'popular_global';
  readonly description = 'Тренды недели (глобально)';
  readonly scope = StrategyScope.GLOBAL;

  calculate(userEvents: UserEvent[], recLength: number): IRecommendationItem[] {
    const productScores: Record<string, number> = {};

    for (const event of userEvents) {
      const eventWeight = event.eventType.weight;
      productScores[event.product_id] =
        (productScores[event.product_id] || 0) + eventWeight;
    }

    const rankedProducts: IRecommendationItem[] = Object.entries(productScores)
      .map(([productId, score]) => ({
        sku: productId,
        score: Math.log1p(score),
      }))
      .sort((a, b) => b.score - a.score);

    return rankedProducts.slice(0, recLength);
  }
}
