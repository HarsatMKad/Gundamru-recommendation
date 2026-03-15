import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { BatchWriter } from './batch-writer.service';
import { Logger } from '@nestjs/common';
import { RecommendationSettingsService } from 'src/recommendation-settings/recommendation-settings.service';
//import { CronExpression } from '@nestjs/schedule';
import { PythonEngineClient } from './python-engine.client';
import { PipelineEngine } from './pipeline-engine.service';

@Injectable()
export class RecommenderOrchestratorFallback {
  private readonly logger = new Logger(RecommenderOrchestratorFallback.name);

  constructor(
    private readonly writer: BatchWriter,
    private readonly settingsService: RecommendationSettingsService,
    private readonly pythonClient: PythonEngineClient,
    private readonly pipelineEngine: PipelineEngine,
  ) {}

  //@Cron(CronExpression.EVERY_DAY_AT_3AM)
  @Cron('0 */10 * * * *') // каждые 10 минут
  async handleCron() {
    this.logger.log('Начат процесс генерации стандартных рекомендаций.');
    const activeConfigs = await this.settingsService.getActiveConfigs();
    const inactiveRecIds = await this.settingsService.getInactiveSettingIds();

    if (inactiveRecIds.length > 0) {
      this.logger.log(`Найдено ${inactiveRecIds.length} отключенных настроек.`);
      await this.writer.deleteRecommendationsBySettingIds(inactiveRecIds);
      this.logger.log('Очистка неактивных рекомендаций завершена.');
    }

    const globalConfigs = activeConfigs.filter((c) => c.is_default);

    const globalStrategies = Array.from(
      new Set(globalConfigs.flatMap((c) => c.methods.map((m) => m.strategy))),
    );

    const globalData =
      await this.pythonClient.fetchGlobalStrategyResults(globalStrategies);

    const batchFallbackData = globalConfigs.map((config) => {
      const globalRecs = this.pipelineEngine.processedGlobal(
        config,
        globalData,
      );
      return {
        name: config.target_context,
        recommended_skus: globalRecs,
        updated_at: new Date(),
      };
    });

    if (batchFallbackData.length > 0) {
      try {
        await this.writer.saveBatchFallback(batchFallbackData);
        this.logger.log(
          `Успешно записано ${batchFallbackData.length} стандартных рекомендаций.`,
        );
      } catch (error) {
        this.logger.error('Ошибка записи стандартных рекомендаций:', error);
      }
    } else {
      this.logger.log(`Записей стандартных рекомендаций сделано не было.`);
    }
  }
}
