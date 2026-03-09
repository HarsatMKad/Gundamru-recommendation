import { Injectable } from '@nestjs/common';
import { StrategyFactory } from './strategy-factory.service';
import { RecommendationSettingsService } from 'src/recommendation-settings/recommendation-settings.service';
import { Logger } from '@nestjs/common';

@Injectable()
export class PipelineEngine {
  private readonly logger = new Logger(PipelineEngine.name);
  constructor(
    private readonly factory: StrategyFactory,
    private readonly settingsService: RecommendationSettingsService,
  ) {}

  async runForContext(userId: number, context: string) {
    const config = await this.settingsService.getByContext(context);
    const scores = new Map<number, number>();

    if (!config) {
      this.logger.warn(`Конфигурация для контекста ${context} не найдена.`);
      return [];
    }

    if (!config.isActive) {
      this.logger.warn(`Конфигурация для контекста ${context} отключена.`);
      return [];
    }

    for (const method of config.methods) {
      const strategy = this.factory.getStrategy(method.strategy);
      const strategyResult = await strategy.generate(userId, context);

      for (const item of strategyResult) {
        const current = scores.get(item.sku) || 0;
        scores.set(item.sku, current + item.score * method.weight);
      }
    }

    return Array.from(scores.entries())
      .map(([sku, score]) => ({ sku, score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5); // топ 5 товаров
  }
}
