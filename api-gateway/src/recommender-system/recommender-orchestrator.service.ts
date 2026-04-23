import { Injectable, Logger } from '@nestjs/common';
import {
  IAggregateFallback,
  IRecommendationInput,
} from '../common/interface/recommendation.interface';
import { RecommendationSettingsService } from 'src/recommendation-settings/recommendation-settings.service';
import { PipelineEngine } from './pipeline-engine.service';
import { ELogHandler } from 'src/common/enum/LogHandler.enum';
import { ConfigService } from '@nestjs/config';
import { RecommendationSetting } from 'src/database/entities/recommendation-settings.entity';
import { RecommendationDataService } from './recommendation-data.service';
import { RecommendationCalculatorService } from './recommendation.calculator.service';
import {
  ICronConfig,
  IGenerationConfig,
} from 'src/common/interface/config.interface';
import { EConfigKey } from 'src/common/enum/ConfigKey.enum';
import { RecommendationService } from 'src/recommendation/recommendations.service';
import { CronJob } from 'node_modules/cron/dist';
import { SchedulerRegistry } from 'node_modules/@nestjs/schedule';

@Injectable()
export class RecommenderOrchestrator {
  private readonly logger = new Logger(RecommenderOrchestrator.name);
  private readonly recLength: number;
  constructor(
    private readonly configService: ConfigService,
    private readonly pipelineEngine: PipelineEngine,
    private readonly settingsService: RecommendationSettingsService,
    private readonly recommendationCalculatorService: RecommendationCalculatorService,
    private readonly recommendationDataService: RecommendationDataService,
    private readonly recommendationService: RecommendationService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {
    this.recLength =
      this.configService.get<IGenerationConfig>(EConfigKey.generation)
        ?.length ?? 10;
  }

  onModuleInit() {
    const cronTime =
      this.configService.get<ICronConfig>(EConfigKey.cron)?.generationTime ??
      '0 4 * * *';

    const job = new CronJob(
      cronTime,
      () => this.runGeneration(),
      null,
      false,
      'Europe/Moscow',
    );
    this.schedulerRegistry.addCronJob('generation_job', job);
    job.start();
  }

  async runGeneration() {
    this.logger.log(ELogHandler.REC_GENERATION_START);
    const generateStart = performance.now();

    // получаем данные для валидации
    const gettingDataStart = performance.now();
    const { activeConfigs, userEvents, productsWithAttributes } =
      await this.recommendationDataService.getValidationData();
    const gettingDataEnd = performance.now();
    this.logger.debug(
      `Время получения данных: ${(gettingDataEnd - gettingDataStart) / 1000} секунд`,
    );

    if (activeConfigs.length === 0 || userEvents.length === 0) {
      this.logger.warn('Not enough data.');
      return;
    }

    // Очистка неактивных рекомендаций
    await this.cleanupInactiveRecommendations(activeConfigs);

    this.logger.log('1. Расчет методов.');
    const strategysResult =
      await this.recommendationCalculatorService.calculateRecommendationsStrategys(
        this.recLength,
        activeConfigs,
        userEvents,
        productsWithAttributes,
      );

    // разделяем настройки на персональные и стандартные
    const { personalConfigs, fallbackConfigs } =
      this.separateSonfigs(activeConfigs);

    this.logger.log('2. Агрегация методов.');
    const aggregateStart = performance.now();
    const aggregatedPersonalRecs =
      this.pipelineEngine.aggregatePersonalStrategys(
        this.recLength,
        personalConfigs,
        strategysResult.personalResults,
      );

    const aggregateGlobalRecs = this.pipelineEngine.aggregateFallbacks(
      this.recLength,
      fallbackConfigs,
      strategysResult.globalResults,
    );
    const aggregateEnd = performance.now();
    this.logger.debug(
      `Время агрегации: ${(aggregateEnd - aggregateStart) / 1000} секунд`,
    );

    this.logger.log('3. Сохранение.');
    const saveStart = performance.now();
    await Promise.all([
      this.savePersonalRecs(aggregatedPersonalRecs),
      this.saveGlobalRecs(aggregateGlobalRecs),
    ]);
    const saveEnd = performance.now();

    this.logger.debug(
      `Время сохранения: ${(saveEnd - saveStart) / 1000} секунд`,
    );

    this.logger.log(ELogHandler.REC_GENERATION_STOP);

    const generateEnd = performance.now();
    this.logger.debug(
      `Общее время генерации: ${(generateEnd - generateStart) / 1000} секунд`,
    );
  }

  private async cleanupInactiveRecommendations(
    activeSettings: RecommendationSetting[],
  ) {
    if (activeSettings.length === 0) return;

    const settingIds: string[] = activeSettings.map((item) => item.id);
    const deleted =
      await this.recommendationService.deleteRecommendationsNotInSettingIds(
        settingIds,
      );

    if (deleted > 0) {
      this.logger.debug(
        `${ELogHandler.CLEANING_RECOMMENDATIONS}: ${settingIds.length}`,
      );
    }
  }

  private separateSonfigs(configs: RecommendationSetting[]) {
    const personalConfigs = configs.filter(
      (c) => c.personal_methods?.length > 0,
    );
    const fallbackConfigs = configs.filter((c) => c.fallback_strategy);
    return { personalConfigs, fallbackConfigs };
  }

  private async savePersonalRecs(
    batchData: IRecommendationInput[],
  ): Promise<void> {
    if (batchData.length > 0) {
      await this.recommendationService.saveBatch(batchData);
    }
  }

  private async saveGlobalRecs(batchData: IAggregateFallback[]): Promise<void> {
    await Promise.all(
      batchData.map(async ({ configId, fallbacks }) => {
        await this.settingsService.updateFallback(configId, {
          fallback_skus: fallbacks,
          fallback_updated_at: new Date(),
        });
      }),
    );
  }
}
