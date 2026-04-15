import { Injectable, Logger } from '@nestjs/common';
import {
  TPersonalResults,
  TGlobalResults,
  TPythonResponse,
  TPersonalStrategyResult,
} from 'src/common/type/StrategyResult.type';
import { StrategyRegistry } from './strategy-registry';
import { UserEvent } from 'src/database/entities/user-event.entity';
import { performance } from 'perf_hooks';
import { IProductWithAttributes } from 'src/common/interface/entites.interface';
import { RecommendationSetting } from 'src/database/entities/recommendation-settings.entity';
import { IBaseRectrategy } from 'src/common/interface/strategies.interface';
import path from 'path';
import { spawnSync } from 'child_process';
import { IStrategyResultItem } from 'src/common/interface/recommendation.interface';
import { pythonConfig } from 'src/common/config/GenerateParams';

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

    const activeGlobalStrategies =
      this.strategyRegistry.getGlobalStrategiesByNames([
        ...globalStrategyNames,
      ]);

    const allResults = this.callPythonEngine(
      recLength,
      [...activePersonalStrategies, ...activeGlobalStrategies],
      userEvents,
      products,
    );

    const personalResults: TPersonalResults = {};
    const globalResults: TGlobalResults = {};

    for (const strategy of activePersonalStrategies) {
      const result = allResults[strategy.name];
      if (result) {
        personalResults[strategy.name] = result as TPersonalStrategyResult;
      }
    }

    for (const strategy of activeGlobalStrategies) {
      const result = allResults[strategy.name];
      if (result) {
        globalResults[strategy.name] = result as IStrategyResultItem[];
      }
    }

    return {
      personalResults: Object.keys(personalResults).length
        ? personalResults
        : undefined,
      globalResults: Object.keys(globalResults).length
        ? globalResults
        : undefined,
    };
  }

  private callPythonEngine(
    recLength: number,
    strategies: IBaseRectrategy[],
    userEvents: UserEvent[],
    products: IProductWithAttributes[],
  ): TPythonResponse {
    const startTime = performance.now();

    const payload = {
      recLength: recLength,
      strategies: strategies.map((s) => s.name),
      events: userEvents.map((e) => ({
        user_id: e.user_id,
        product_id: e.product_id,
        weight: e.weight,
        count: e.count,
        timestamp: e.timestamp.getTime(),
        retention_days: e.retentionDays,
      })),
      products: products.map((p) => ({
        id: p.id,
        brand_id: p.brand_id,
        grade: p.grade,
        scale: p.scale,
        price: p.price,
      })),
    };

    this.logger.debug(
      `Начат расчет стратегий: ${strategies.map((s) => s.name).join(', ')}`,
    );

    try {
      const scriptPath = path.join(
        pythonConfig.PYTHON_BASE_PATH,
        pythonConfig.PYTHON_GATEWAY_NAME,
      );

      const pythonProcess = spawnSync(pythonConfig.PYTHON_PATH, [scriptPath], {
        input: JSON.stringify(payload),
        encoding: 'utf-8',
        maxBuffer: 1024 * 1024 * 50,
      });

      if (pythonProcess.stderr) {
        this.logger.debug('Python stderr:', pythonProcess.stderr.toString());
      }

      if (pythonProcess.error) {
        throw new Error(`Python error: ${pythonProcess.error.message}`);
      }

      const result = JSON.parse(pythonProcess.stdout) as TPythonResponse;
      const endTime = performance.now();

      this.logger.debug(
        `Вызов расчета стратегий выполнился за ${(endTime - startTime) / 1000} секунд`,
      );

      return result;
    } catch (error) {
      this.logger.error('Ошибка при вызове Python engine:', error);
      return {};
    }
  }
}
