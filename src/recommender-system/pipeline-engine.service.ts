import { Injectable } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import {
  RecommendationConfig,
  RecommendationItem as RecItem,
} from './interface/recommendation.interface';

@Injectable()
export class PipelineEngine {
  private readonly logger = new Logger(PipelineEngine.name);
  private recLength = 5; // Размер списка рекомендаций

  processed(
    config: RecommendationConfig,
    userId: number,
    strategyData: Record<string, Record<number, RecItem[]>>,
  ): RecItem[] {
    if (!config.isActive) {
      this.logger.warn(
        `Конфигурация для контекста ${config?.target_context} отключена или не найдена.`,
      );
      return [];
    }

    const scores = new Map<number, number>();
    for (const method of config.methods) {
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
    config: RecommendationConfig,
    globalStrategyData: Record<string, RecItem[]>,
  ): RecItem[] {
    const scores = new Map<number, number>();

    for (const method of config.methods) {
      const strategyResults = globalStrategyData[method.strategy] || [];
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
}
