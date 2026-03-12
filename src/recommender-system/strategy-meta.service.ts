import { Injectable } from '@nestjs/common';
import { StrategyMetadata } from './interface/strategy.interface';

@Injectable()
export class StrategyMetaService {
  private readonly strategiesMetadata: StrategyMetadata[] = [
    {
      name: 'popular',
      description:
        'Popular Filtering Recommendations based on overall popularity.',
    },
    {
      name: 'collab',
      description:
        'Collaborative Filtering Recommendations based on user similarities.',
    },
  ];

  getAllStrategies(): StrategyMetadata[] {
    return this.strategiesMetadata;
  }

  getStrategy(name: string): StrategyMetadata | undefined {
    return this.strategiesMetadata.find((s) => s.name === name);
  }
}
