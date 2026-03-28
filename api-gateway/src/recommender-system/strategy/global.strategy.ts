import {
  StrategyScope,
  IGlobalStrategy,
} from 'src/common/interface/strategies.interface';
import { Injectable } from '@nestjs/common';
import { UserEvent } from 'src/user-events/entities/user-event.entity';
import { RecommendationItem } from 'src/common/interface/recommendation.interface';

@Injectable()
export class GlobalPopularStrategy implements IGlobalStrategy {
  readonly name = 'popular_global';
  readonly scope = StrategyScope.GLOBAL;
  calculate(userEvents: UserEvent[], recLength: number): RecommendationItem[] {
    const productScores: Record<string, number> = {};

    for (const event of userEvents) {
      const eventWeight = event.eventType.weight;
      productScores[event.product_id] =
        (productScores[event.product_id] || 0) + eventWeight;
    }

    const rankedProducts: RecommendationItem[] = Object.entries(productScores)
      .map(([productId, score]) => ({ sku: productId, score }))
      .sort((a, b) => b.score - a.score);

    return rankedProducts.slice(0, recLength);
  }
}
