import { Injectable } from '@nestjs/common';
import { BatchWriter } from './batch-writer.service';
import { Logger } from '@nestjs/common';
import { RecommendationInput } from '../common/interface/recommendation.interface';
import { RecommendationSettingsService } from 'src/recommendation-settings/recommendation-settings.service';
import { PipelineEngine } from './pipeline-engine.service';
import { LOG_HANDLER } from 'src/common/util/log-handler.util';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { RecommenderSetting } from 'src/recommendation-settings/entities/settings.entity';
import { CronJob } from 'cron';
import {
  PersonalResults,
  GlobalResults,
} from 'src/common/interface/strategies.interface';
import { RecommendationDataService } from './recommendation-data.service';
import { RecommendationCalculatorService } from './recommendation.calculator.service';
import { RECOMMENDATION_LENTGH } from 'src/common/util/const-handler.util';

@Injectable()
export class RecommenderOrchestrator {
  private readonly logger = new Logger(RecommenderOrchestrator.name);
  constructor(
    private readonly writer: BatchWriter,
    private readonly settingsService: RecommendationSettingsService,
    private readonly pipelineEngine: PipelineEngine,
    private configService: ConfigService,
    private schedulerRegistry: SchedulerRegistry,
    private readonly recommendationCalculatorService: RecommendationCalculatorService,
    private readonly recommendationDataService: RecommendationDataService,
  ) {}

  onModuleInit() {
    const cronTime =
      this.configService.get<string>('CRON_GENERATION_TIME') || '0 4 * * *';
    // запуск каждый день по расписанию в CRON_GENERATION_TIME
    const job = new CronJob(
      cronTime,
      () => this.handleCron(),
      null,
      false,
      'Europe/Moscow',
    );
    this.schedulerRegistry.addCronJob('generation_job', job);
    job.start();
  }

  async handleCron() {
    this.logger.log(LOG_HANDLER.REC_GENERATION_START);

    // получаем данные для валидации
    const valData = await this.recommendationDataService.getValidationData();
    const { validUserIds, activeConfigs, inactiveRecIds } = valData;

    if (validUserIds.length === 0) {
      this.logger.warn('No valid users.');
      return;
    }

    // Очистка устаревших данных
    await this.cleanupInactiveSettings(inactiveRecIds);

    // Валидация стратегий
    this.logger.log('ВАЛИДАЦИЯ СТРАТЕГИЙ');
    const { personalStrategys, globalStrategys } =
      this.validateStrategies(activeConfigs);

    // получаем данные для генерации
    this.logger.log('ПОЛУЧАЕМ ДАННЫЕ ДЛЯ ГЕНЕРАЦИИ');
    const userEvents =
      await this.recommendationDataService.getRelevantEvents(validUserIds);

    // получаем сырые рекомендации
    this.logger.log('ПОЛУЧАЕМ СЫРЫЕ ПЕРСОНАЛЬНЫЕ РЕКОМЕНДАЦИИ');
    const personalData =
      this.recommendationCalculatorService.calculatePersonalRecommendations(
        validUserIds,
        userEvents,
        personalStrategys,
        RECOMMENDATION_LENTGH, // добавить обработку
      );

    // получаем сырые рекомендации
    this.logger.log('ПОЛУЧАЕМ СЫРЫЕ ГЛОБАЛЬНЫЕ РЕКОМЕНДАЦИИ');
    const globalData =
      this.recommendationCalculatorService.calculateGlobalRecommendations(
        userEvents,
        globalStrategys,
        RECOMMENDATION_LENTGH, // добавить обработку
      );

    const { personalConfigs, fallbackConfigs } =
      this.separateSonfigs(activeConfigs);

    this.logger.log('СОХРАНЯЕМ');
    await Promise.all([
      this.savePersonalRecs(personalConfigs, validUserIds, personalData),
      this.saveFallbackRecs(fallbackConfigs, globalData),
    ]);
    this.logger.log(LOG_HANDLER.REC_GENERATION_STOP);
  }

  private async cleanupInactiveSettings(ids: string[]) {
    if (ids.length === 0) return;
    this.logger.log(`${LOG_HANDLER.DISABLED_SETTINGS_FOUND}: ${ids.length}`);
    await this.writer.deleteRecommendationsBySettingIds(ids);
    this.logger.log(LOG_HANDLER.CLEANING_REC_COMPLETE);
  }

  private validateStrategies(configs: RecommenderSetting[]) {
    const personalStrategyNames = new Set<string>();
    const fallbackStrategyNames = new Set<string>();

    for (const config of configs) {
      config.personal_methods.forEach((method) =>
        personalStrategyNames.add(method.strategy),
      );
      if (config.fallback_strategy) {
        fallbackStrategyNames.add(config.fallback_strategy);
      }
    }

    this.logger.log('personal strategis:', personalStrategyNames);
    this.logger.log('global strategis:', fallbackStrategyNames);

    return {
      personalStrategys: Array.from(personalStrategyNames),
      globalStrategys: Array.from(fallbackStrategyNames),
    };
  }

  private separateSonfigs(configs: RecommenderSetting[]) {
    const personalConfigs = configs.filter(
      (c) => c.personal_methods?.length > 0,
    );
    const fallbackConfigs = configs.filter((c) => c.fallback_strategy);

    return { personalConfigs, fallbackConfigs };
  }

  private async savePersonalRecs(
    configs: RecommenderSetting[],
    userIds: string[],
    personalData: PersonalResults,
  ): Promise<void> {
    const batchData: RecommendationInput[] = [];
    for (const config of configs) {
      for (const userId of userIds) {
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
      await this.writer.saveBatch(batchData);
      this.logger.log(`${LOG_HANDLER.REC_SAVED}. Count: ${batchData.length}`);
    } else {
      this.logger.log(LOG_HANDLER.REC_NO_SAVED);
    }
  }

  private async saveFallbackRecs(
    configs: RecommenderSetting[],
    globalData: GlobalResults,
  ): Promise<void> {
    await Promise.all(
      configs.map(async (config) => {
        if (config.fallback_strategy && config.fallback_weight) {
          const globalRecs = this.pipelineEngine.processedGlobal(
            config.fallback_strategy,
            config.fallback_weight,
            globalData,
          );

          await this.settingsService.updateFallback(config.id, {
            fallback_skus: globalRecs,
            fallback_updated_at: new Date(),
          });
        }
      }),
    );

    this.logger.log(LOG_HANDLER.FALLBACK_UPDATE_COMPLETE);
  }
}
