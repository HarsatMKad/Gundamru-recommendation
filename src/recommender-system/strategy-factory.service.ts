import { Injectable } from '@nestjs/common';
import { RecommendationStrategy } from './strategies/strategy.interface';
import { CollabStrategy } from './strategies/collab.strategy';
import { PopularStrategy } from './strategies/popular.strategy';

@Injectable()
export class StrategyFactory {
  private strategiesMap: Record<string, RecommendationStrategy> = {};

  constructor(
    private readonly collab: CollabStrategy,
    private readonly popular: PopularStrategy,
  ) {
    this.strategiesMap = {
      [this.collab.name]: this.collab,
      [this.popular.name]: this.popular,
    };
  }

  getStrategy(name: string): RecommendationStrategy {
    const strategy = this.strategiesMap[name];
    if (!strategy) {
      throw new Error(`Strategy ${name} not found`);
    }
    return strategy;
  }

  getAllStrategy(): RecommendationStrategy[] {
    return Object.values(this.strategiesMap);
  }
}
