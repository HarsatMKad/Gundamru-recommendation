import { Injectable } from '@nestjs/common';
import { StrategyFactory } from './strategy-factory.service';

@Injectable()
export class StrategyMetaService {
  constructor(private readonly factory: StrategyFactory) {}

  getAvailableStrategies() {
    const instances = this.factory.getAllStrategy();

    return instances.map((strategy) => ({
      name: strategy.name,
      description: strategy.description,
    }));
  }
}
