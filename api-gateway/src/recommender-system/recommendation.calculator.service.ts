import { Injectable, Logger } from '@nestjs/common';
import {
  TPersonalResults,
  TGlobalResults,
} from 'src/common/type/StrategyResult.type';
import { StrategyRegistry } from './strategy-registry';
import { UserEvent } from 'src/database/entities/user-event.entity';
import { performance } from 'perf_hooks';

@Injectable()
export class RecommendationCalculatorService {
  private readonly logger = new Logger(RecommendationCalculatorService.name);
  constructor(private readonly strategyRegistry: StrategyRegistry) {}

  calculatePersonalRecommendations(
    userEvents: UserEvent[],
    personalStrategyNames: string[],
    recLength: number,
  ): TPersonalResults {
    const TPersonalResultsMap: TPersonalResults = {};
    const activePersonalStrategies =
      this.strategyRegistry.getPersonalStrategiesByNames(personalStrategyNames);

    if (activePersonalStrategies.length === 0) {
      this.logger.warn('No active personal strategies found for calculation.');
      return {};
    }

    for (const strategy of activePersonalStrategies) {
      try {
        const start = performance.now();
        const result = strategy.calculate(userEvents, recLength);
        const end = performance.now();
        this.logger.debug(
          `Время расчета ${strategy.name}: ${(end - start) / 1000} секунд`,
        );
        TPersonalResultsMap[strategy.name] = result;
      } catch (error) {
        this.logger.error(
          `Error calculating personal strategy ${strategy.name}:`,
          error,
        );
      }
    }
    return TPersonalResultsMap;
  }

  calculateGlobalRecommendations(
    userEvents: UserEvent[],
    globalStrategyNames: string[],
    recLength: number,
  ): TGlobalResults {
    const TGlobalResultsMap: TGlobalResults = {};
    const activeGlobalStrategies =
      this.strategyRegistry.getGlobalStrategiesByNames(globalStrategyNames);

    if (activeGlobalStrategies.length === 0) {
      this.logger.warn('No active global strategies found for calculation.');
      return {};
    }

    activeGlobalStrategies.map((strategy) => {
      try {
        const start = performance.now();
        const result = strategy.calculate(userEvents, recLength);
        const end = performance.now();
        this.logger.debug(
          `Время расчета ${strategy.name}: ${(end - start) / 1000} секунд`,
        );
        TGlobalResultsMap[strategy.name] = result;
      } catch (error) {
        this.logger.error(
          `Error calculating global strategy ${strategy.name}:`,
          error,
        );
      }
    });
    return TGlobalResultsMap;
  }
}
