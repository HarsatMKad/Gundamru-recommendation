import { Injectable } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import {
  IAggregateFallback,
  IRecommendationConfig,
  IRecommendationInput,
  IRecommendationItem,
} from '../common/interface/recommendation.interface';
import { EWarnRecSystem } from 'src/common/enum/WarnHandler.enum';
import { RecommendationSetting } from 'src/database/entities/recommendation-settings.entity';
import {
  TGlobalResults,
  TPersonalResults,
} from 'src/common/type/StrategyResult.type';

@Injectable()
export class PipelineEngine {
  private readonly logger = new Logger(PipelineEngine.name);

  aggregatePersonalStrategys(
    recLength: number,
    configs: RecommendationSetting[],
    personalData: TPersonalResults,
  ): IRecommendationInput[] {
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
    globalData: TGlobalResults,
  ): IAggregateFallback[] {
    const aggregatedResults: IAggregateFallback[] = [];
    for (const config of configs) {
      if (!config.isActive) {
        this.logger.warn(
          `${EWarnRecSystem.CONFIG_NOT_FOUND}: ${config.target_context}.`,
        );
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
    config: IRecommendationConfig,
    userId: string,
    strategyData: Record<string, Record<string, IRecommendationItem[]>>,
  ): IRecommendationItem[] {
    if (!config.isActive) {
      this.logger.warn(
        `${EWarnRecSystem.CONFIG_NOT_FOUND} for context: ${config.target_context}.`,
      );
      return [];
    }
    const scores = new Map<string, number>();

    // Итерируемся по методам этой настройки
    for (const method of config.personal_methods) {
      const strategyMap = strategyData[method.strategy];
      // Получаем результат для данного пользователя в этой стратегии
      const strategyResults = strategyMap?.[userId] || [];

      for (const item of strategyResults) {
        const current = scores.get(item.sku) || 0;
        // Добавляем вес и оценку
        scores.set(item.sku, current + item.score * method.weight);
      }
    }
    return Array.from(scores.entries())
      .map(([sku, score]) => ({ sku, score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, recLength);
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
