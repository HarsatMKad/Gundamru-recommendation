import {
  IPersonalStrategy,
  IGlobalStrategy,
  IBaseRectrategy,
} from 'src/common/interface/strategies.interface';
import { CollabStrategy } from './strategy/collab.strategy';
import { GlobalPopularStrategy } from './strategy/global.strategy';
import { StrategyScope } from 'src/common/enum/StrategyScope.enum';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Logger } from '@nestjs/common';

@Injectable()
export class StrategyRegistry implements OnModuleInit {
  private readonly logger = new Logger(StrategyRegistry.name);
  private personalStrategies: Map<string, IPersonalStrategy> = new Map();
  private globalStrategies: Map<string, IGlobalStrategy> = new Map();

  constructor(
    private readonly collabStrategy: CollabStrategy,
    private readonly globalRecStrategy: GlobalPopularStrategy,
  ) {}

  onModuleInit() {
    this.registerStrategy(this.collabStrategy);
    this.registerStrategy(this.globalRecStrategy);
  }

  private registerStrategy(strategy: IBaseRectrategy) {
    if (strategy.scope === StrategyScope.PERSONAL) {
      this.personalStrategies.set(strategy.name, strategy as IPersonalStrategy);
    } else if (strategy.scope === StrategyScope.GLOBAL) {
      this.globalStrategies.set(strategy.name, strategy as IGlobalStrategy);
    }
  }

  getPersonalStrategy(name: string): IPersonalStrategy | undefined {
    return this.personalStrategies.get(name);
  }

  getGlobalStrategy(name: string): IGlobalStrategy | undefined {
    return this.globalStrategies.get(name);
  }

  getPersonalStrategiesByNames(names: string[]): IPersonalStrategy[] {
    const missing = names.filter((name) => !this.personalStrategies.has(name));
    missing.forEach((name) => this.logger.warn(`Strategy not found: ${name} `));
    return names
      .map((name) => this.getPersonalStrategy(name))
      .filter((s): s is IPersonalStrategy => !!s);
  }

  getGlobalStrategiesByNames(names: string[]): IGlobalStrategy[] {
    const missing = names.filter((name) => !this.globalStrategies.has(name));
    missing.forEach((name) => this.logger.warn(`Strategy not found: ${name} `));
    return names
      .map((name) => this.getGlobalStrategy(name))
      .filter((s): s is IGlobalStrategy => !!s);
  }
}
