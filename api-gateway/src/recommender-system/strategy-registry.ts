import {
  IPersonalStrategy,
  IGlobalStrategy,
  IBaseRectrategy,
} from 'src/common/interface/strategies.interface';
import { GlobalPopularStrategy } from './strategy/global.strategy';
import { StrategyScope } from 'src/common/enum/StrategyScope.enum';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { IStrategyDefinition } from 'src/common/interface/strategies.interface';
import { ItemBasedCollabStrategy } from './strategy/collab.item-based.strategy';
import { ItemBasedCollabStrategyPython } from './strategy/collab.item-based.python.strategy';
import { Logger } from '@nestjs/common';

@Injectable()
export class StrategyRegistry implements OnModuleInit {
  private readonly logger = new Logger(StrategyRegistry.name);
  private personalStrategies: Map<string, IPersonalStrategy> = new Map();
  private globalStrategies: Map<string, IGlobalStrategy> = new Map();

  constructor(
    private readonly itemBasedCollabStrategyPython: ItemBasedCollabStrategyPython,
    private readonly itemBasedCollabStrategy: ItemBasedCollabStrategy,
    private readonly globalRecStrategy: GlobalPopularStrategy,
  ) {}

  onModuleInit() {
    this.registerStrategy(this.itemBasedCollabStrategy);
    this.registerStrategy(this.itemBasedCollabStrategyPython);
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

  getAllPersonalStrategies(): IStrategyDefinition[] {
    return Array.from(this.personalStrategies.values()).map((s) => ({
      name: s.name,
      description: s.description,
      scope: s.scope,
    }));
  }

  getAllGlobalStrategies(): IStrategyDefinition[] {
    return Array.from(this.globalStrategies.values()).map((s) => ({
      name: s.name,
      description: s.description,
      scope: s.scope,
    }));
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
