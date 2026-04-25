import { Injectable } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import {
  IAggregateFallback,
  IRecommendationInput,
  IRecommendationItem,
} from '../common/interface/recommendation.interface';
import { EWarnRecSystem } from 'src/common/enum/WarnHandler.enum';
import { RecommendationSetting } from 'src/database/entities/recommendation-settings.entity';
import {
  TGlobalResults,
  TPersonalResults,
} from 'src/common/type/StrategyResult.type';
import { agregationConfig } from 'src/common/config/GenerateParams';

@Injectable()
export class AggregatorEngine {
  private readonly ALPHA = agregationConfig.SMOOTHING_ALPHA;
  private readonly logger = new Logger(AggregatorEngine.name);

  aggregatePersonalStrategys(
    recLength: number,
    configs: RecommendationSetting[],
    personalData: TPersonalResults | undefined,
  ): IRecommendationInput[] {
    if (personalData === undefined) {
      return [];
    }
    const batchData: IRecommendationInput[] = [];
    const userIdsFromData = new Set<string>();

    for (const strategyName in personalData) {
      const userDataMap = personalData[strategyName];
      for (const userId in userDataMap) {
        userIdsFromData.add(userId);
      }
    }
    const uniqueUserIds = Array.from(userIdsFromData);

    if (uniqueUserIds.length === 0) {
      return [];
    }

    for (const config of configs) {
      for (const userId of uniqueUserIds) {
        batchData.push({
          user_id: userId,
          setting_id: config.id,
          recommended_skus: this.processedPersonal(
            recLength,
            config,
            userId,
            personalData,
          ),
          generated_at: new Date(),
        });
      }
    }
    return batchData;
  }

  aggregateFallbacks(
    recLength: number,
    configs: RecommendationSetting[],
    globalData?: TGlobalResults,
  ): IAggregateFallback[] {
    if (!globalData) {
      return [];
    }

    const aggregatedResults: IAggregateFallback[] = [];
    for (const config of configs) {
      if (!config.isActive) {
        this.logger.warn(`${EWarnRecSystem.CONFIG_NOT_FOUND}: ${config.name}.`);
        continue;
      }

      if (config.fallback_strategy && config.fallback_weight) {
        const processedRecs = this.processedGlobal(
          recLength,
          config.fallback_strategy,
          config.fallback_weight,
          globalData,
        );
        aggregatedResults.push({
          configId: config.id,
          fallbacks: processedRecs,
        });
      }
    }
    return aggregatedResults;
  }

  private processedPersonal(
    recLength: number,
    config: RecommendationSetting,
    userId: string,
    strategyData: TPersonalResults,
  ): IRecommendationItem[] {
    if (!config.isActive) {
      this.logger.warn(
        `${EWarnRecSystem.CONFIG_NOT_FOUND} for context: ${config.name}.`,
      );
      return [];
    }

    const numerator: Record<string, number> = {}; // Σ(score × confidence × weight)
    const denominator: Record<string, number> = {}; // Σ(weight)
    const methodCount: Record<string, number> = {}; // количество методов, в которых есть товар

    const totalMethods = config.personal_methods.length;

    for (const method of config.personal_methods) {
      const strategyMap = strategyData[method.strategy];
      const strategyResults = strategyMap?.[userId] || [];

      for (const item of strategyResults) {
        numerator[item.sku] =
          (numerator[item.sku] || 0) +
          item.score * item.confidence * method.weight;
        denominator[item.sku] = (denominator[item.sku] || 0) + method.weight;
        methodCount[item.sku] = (methodCount[item.sku] || 0) + 1;
      }
    }

    const results: IRecommendationItem[] = [];
    for (const sku of Object.keys(numerator)) {
      const avgScore = numerator[sku] / denominator[sku];

      const consensusFactor = Math.pow(
        methodCount[sku] / totalMethods,
        this.ALPHA,
      );

      const finalScore = avgScore * consensusFactor;

      results.push({ sku, score: finalScore });
    }
    return results.sort((a, b) => b.score - a.score).slice(0, recLength);
  }

  private processedGlobal(
    recLength: number,
    strategy: string,
    weight: number,
    globalStrategyData: Record<string, IRecommendationItem[]>,
  ): IRecommendationItem[] {
    const results = globalStrategyData[strategy] || [];

    return results
      .map((item) => ({
        sku: item.sku,
        score: item.score * weight,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, recLength);
  }
}
