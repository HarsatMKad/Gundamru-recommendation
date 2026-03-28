import { Injectable } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import {
  IRecommendationConfig,
  IRecommendationItem as RecItem,
} from '../common/interface/recommendation.interface';
import { RECOMMENDATION_LENTGH } from 'src/common/const/ConstHandler.const';
import { EWarnRecSystem } from 'src/common/enum/WarnHandler.enum';

@Injectable()
export class PipelineEngine {
  private readonly logger = new Logger(PipelineEngine.name);
  private recLength = RECOMMENDATION_LENTGH;

  processed(
    config: IRecommendationConfig,
    userId: string,
    strategyData: Record<string, Record<string, RecItem[]>>,
  ): RecItem[] {
    if (!config.isActive) {
      this.logger.warn(
        `${EWarnRecSystem.CONFIG_NOT_FOUND} for context: ${config?.target_context}.`,
      );
      return [];
    }

    const scores = new Map<string, number>();
    for (const method of config.personal_methods) {
      const strategyMap = strategyData[method.strategy];
      const strategyResults = strategyMap?.[userId] || [];
      for (const item of strategyResults) {
        const current = scores.get(item.sku) || 0;
        scores.set(item.sku, current + item.score * method.weight);
      }
    }

    return Array.from(scores.entries())
      .map(([sku, score]) => ({ sku, score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, this.recLength);
  }

  processedGlobal(
    strategy: string,
    weight: number,
    globalStrategyData: Record<string, RecItem[]>,
  ): RecItem[] {
    const results = globalStrategyData[strategy] || [];

    return results
      .map((item) => ({
        sku: item.sku,
        score: item.score * weight,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, this.recLength);
  }
}
