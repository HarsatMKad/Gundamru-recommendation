import { Injectable, Logger } from '@nestjs/common';
import {
  PersonalResults,
  GlobalResults,
} from 'src/common/interface/strategies.interface';
import { StrategyRegistry } from './strategy-registry';
import { UserEvent } from 'src/user-events/entities/user-event.entity';

@Injectable()
export class RecommendationCalculatorService {
  private readonly logger = new Logger(RecommendationCalculatorService.name);
  constructor(private readonly strategyRegistry: StrategyRegistry) {}

  calculatePersonalRecommendations(
    userIds: string[],
    userEvents: UserEvent[],
    personalStrategyNames: string[],
    recLength: number,
  ): PersonalResults {
    const personalResultsMap: PersonalResults = {};
    const activePersonalStrategies =
      this.strategyRegistry.getPersonalStrategiesByNames(personalStrategyNames);

    if (activePersonalStrategies.length === 0) {
      this.logger.warn('No active personal strategies found for calculation.');
      return {};
    }

    this.logger.log(
      `Calculating personal recommendations for ${userIds.length} users using ${activePersonalStrategies.length} strategies`,
    );

    for (const strategy of activePersonalStrategies) {
      try {
        this.logger.debug(`Calculating personal strategy: ${strategy.name}`);
        const result = strategy.calculate(userIds, userEvents, recLength);
        personalResultsMap[strategy.name] = result;
        this.logger.debug(
          `Successfully calculated ${strategy.name} for ${Object.keys(result).length} users`,
        );
      } catch (error) {
        this.logger.error(
          `Error calculating personal strategy ${strategy.name}:`,
          error,
        );
      }
    }
    return personalResultsMap;
  }

  calculateGlobalRecommendations(
    userEvents: UserEvent[],
    globalStrategyNames: string[],
    recLength: number,
  ): GlobalResults {
    const globalResultsMap: GlobalResults = {};
    const activeGlobalStrategies =
      this.strategyRegistry.getGlobalStrategiesByNames(globalStrategyNames);

    if (activeGlobalStrategies.length === 0) {
      this.logger.warn('No active global strategies found for calculation.');
      return {};
    }

    activeGlobalStrategies.map((strategy) => {
      try {
        const result = strategy.calculate(userEvents, recLength);
        globalResultsMap[strategy.name] = result;
      } catch (error) {
        this.logger.error(
          `Error calculating global strategy ${strategy.name}:`,
          error,
        );
      }
    });
    return globalResultsMap;
  }
}
