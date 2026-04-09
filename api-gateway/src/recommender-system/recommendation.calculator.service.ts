import { Injectable, Logger } from '@nestjs/common';
import {
  TPersonalResults,
  TGlobalResults,
  TStrategyResult,
} from 'src/common/type/StrategyResult.type';
import { StrategyRegistry } from './strategy-registry';
import { UserEvent } from 'src/database/entities/user-event.entity';
import { performance } from 'perf_hooks';
import { IProductWithAttributes } from 'src/common/interface/entites.interface';
import { RecommendationSetting } from 'src/database/entities/recommendation-settings.entity';
import { IBaseRectrategy } from 'src/common/interface/strategies.interface';
import { StrategyScope } from 'src/common/enum/StrategyScope.enum';

@Injectable()
export class RecommendationCalculatorService {
  private readonly logger = new Logger(RecommendationCalculatorService.name);
  constructor(private readonly strategyRegistry: StrategyRegistry) {}

  calculateRecommendationsStrategys(
    recLength: number,
    strategys: RecommendationSetting[],
    userEvents: UserEvent[],
    products: IProductWithAttributes[],
  ): {
    personalResults: TPersonalResults | undefined;
    globalResults: TGlobalResults | undefined;
  } {
    const personalStrategyNames = new Set<string>();
    const globalStrategyNames = new Set<string>();

    for (const strategy of strategys) {
      strategy.personal_methods.forEach((method) =>
        personalStrategyNames.add(method.strategy),
      );
      if (strategy.fallback_strategy) {
        globalStrategyNames.add(strategy.fallback_strategy);
      }
    }

    const activePersonalStrategies =
      this.strategyRegistry.getPersonalStrategiesByNames([
        ...personalStrategyNames,
      ]);

    const personalResults = this.calculateStrategys(
      activePersonalStrategies,
      recLength * 2,
      userEvents,
      products,
      StrategyScope.PERSONAL,
    );

    const activeGlobalStrategies =
      this.strategyRegistry.getGlobalStrategiesByNames([
        ...globalStrategyNames,
      ]);

    const globalResults = this.calculateStrategys(
      activeGlobalStrategies,
      recLength,
      userEvents,
      products,
      StrategyScope.GLOBAL,
    );

    return { personalResults, globalResults };
  }

  calculateStrategys(
    activeStrategies: IBaseRectrategy[],
    recLength: number,
    userEvents: UserEvent[],
    products: IProductWithAttributes[],
    strategyType: StrategyScope.PERSONAL,
  ): TPersonalResults | undefined;

  calculateStrategys(
    activeStrategies: IBaseRectrategy[],
    recLength: number,
    userEvents: UserEvent[],
    products: IProductWithAttributes[],
    strategyType: StrategyScope.GLOBAL,
  ): TGlobalResults | undefined;

  calculateStrategys(
    activeStrategies: IBaseRectrategy[],
    recLength: number,
    userEvents: UserEvent[],
    products: IProductWithAttributes[],
  ): TStrategyResult | undefined {
    if (activeStrategies.length === 0) {
      this.logger.warn('No active personal strategies found for calculation.');
      return;
    }

    const results: TStrategyResult = {};
    for (const strategy of activeStrategies) {
      try {
        const start = performance.now();
        const result = strategy.calculate(recLength, userEvents, products);
        results[strategy.name] = result;
        const end = performance.now();
        this.logger.debug(
          `Время расчета ${strategy.name}: ${(end - start) / 1000} секунд`,
        );
      } catch (error) {
        this.logger.error(
          `Error calculating personal strategy ${strategy.name}:`,
          error,
        );
      }
    }
    return results;
  }
}
