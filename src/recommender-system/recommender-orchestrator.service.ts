import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { BatchWriter } from './batch-writer.service';
import { Logger } from '@nestjs/common';
import { RecommendationInput } from './interface/recommendation.interface';
import { RecommendationSettingsService } from 'src/recommendation-settings/recommendation-settings.service';
//import { CronExpression } from '@nestjs/schedule';
import { PythonEngineClient } from './python-engine.client';
import { PipelineEngine } from './pipeline-engine.service';
import { UserIdsProvider } from './user-ids.provider';

@Injectable()
export class RecommenderOrchestrator {
  private readonly logger = new Logger(RecommenderOrchestrator.name);

  constructor(
    private readonly writer: BatchWriter,
    private readonly userIdsProvider: UserIdsProvider,
    private readonly settingsService: RecommendationSettingsService,
    private readonly pythonClient: PythonEngineClient,
    private readonly pipelineEngine: PipelineEngine,
  ) {}

  //@Cron(CronExpression.EVERY_DAY_AT_3AM)
  @Cron('0 */2 * * * *') // каждые 2 минуты
  async handleCron() {
    this.logger.log('Начат процесс генерации рекомендаций.');
    const validUserIds = await this.userIdsProvider.getValidUserIds();
    const activeConfigs = await this.settingsService.getActiveConfigs();
    const inactiveRecIds = await this.settingsService.getInactiveSettingIds();

    if (inactiveRecIds.length > 0) {
      this.logger.log(`Найдено ${inactiveRecIds.length} отключенных настроек.`);
      await this.writer.deleteRecommendationsBySettingIds(inactiveRecIds);
      this.logger.log('Очистка неактивных рекомендаций завершена.');
    }

    const personalConfigs = activeConfigs.filter((c) => !c.is_default);

    const personalStrategies = Array.from(
      new Set(personalConfigs.flatMap((c) => c.methods.map((m) => m.strategy))),
    );

    const personalData = await this.pythonClient.fetchPersonalStrategyResults(
      personalStrategies,
      validUserIds,
    );

    const batchData: RecommendationInput[] = [];
    for (const config of activeConfigs.filter((c) => !c.is_default)) {
      for (const userId of validUserIds) {
        batchData.push({
          user_id: userId,
          setting_id: config.id,
          recommended_skus: this.pipelineEngine.processed(
            config,
            userId,
            personalData,
          ),
          generated_at: new Date(),
        });
      }
    }

    if (batchData.length > 0) {
      try {
        await this.writer.saveBatch(batchData);
        this.logger.log(`Успешно записано ${batchData.length} рекомендаций.`);
      } catch (error) {
        this.logger.error('Ошибка записи рекомендаций:', error);
      }
    } else {
      this.logger.log(`Записей сделано не было.`);
    }
  }
}
