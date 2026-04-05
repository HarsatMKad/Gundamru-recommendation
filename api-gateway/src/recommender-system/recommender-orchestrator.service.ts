import { Injectable, Logger } from '@nestjs/common';
import { BatchWriter } from './batch-writer.service';
import {
  IAggregateFallback,
  IRecommendationInput,
} from '../common/interface/recommendation.interface';
import { RecommendationSettingsService } from 'src/recommendation-settings/recommendation-settings.service';
import { PipelineEngine } from './pipeline-engine.service';
import { ELogHandler } from 'src/common/enum/LogHandler.enum';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { RecommendationSetting } from 'src/database/entities/recommendation-settings.entity';
import { IRecommendationDataService } from './recommendation-data.service';
import { RecommendationCalculatorService } from './recommendation.calculator.service';
import { CronJob } from 'cron';
import {
  ICronConfig,
  IGenerationConfig,
} from 'src/common/interface/config.interface';
import { EConfigKey } from 'src/common/enum/ConfigKey.enum';

@Injectable()
export class RecommenderOrchestrator {
  private readonly logger = new Logger(RecommenderOrchestrator.name);
  private readonly recLength: number;
  constructor(
    private configService: ConfigService,
    private readonly writer: BatchWriter,
    private schedulerRegistry: SchedulerRegistry,
    private readonly pipelineEngine: PipelineEngine,
    private readonly settingsService: RecommendationSettingsService,
    private readonly recommendationCalculatorService: RecommendationCalculatorService,
    private readonly IRecommendationDataService: IRecommendationDataService,
  ) {
    this.recLength =
      this.configService.get<IGenerationConfig>(EConfigKey.generation)
        ?.length ?? 10;
  }

  onModuleInit() {
    // запуск каждый день по расписанию generationTime или в 4ч ночи по мск
    const cronTime =
      this.configService.get<ICronConfig>(EConfigKey.cron)?.generationTime ??
      '0 4 * * *';
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
    this.logger.log(ELogHandler.REC_GENERATION_START);
    const generateStart = performance.now();

    // получаем данные для валидации
    const gettingDataStart = performance.now();
    const valData = await this.IRecommendationDataService.getValidationData();
    const gettingDataEnd = performance.now();
    this.logger.debug(
      `Время получения данных: ${(gettingDataEnd - gettingDataStart) / 1000} секунд`,
    );
    const { activeConfigs, inactiveRecIds, userEvents } = valData;

    if (activeConfigs.length === 0 || userEvents.length === 0) {
      this.logger.warn('Not enough data.');
      return;
    }

    // Очистка устаревших рекомендаций
    await this.cleanupInactiveSettings(inactiveRecIds);

    const { personalStrategys, globalStrategys } =
      this.validateStrategies(activeConfigs);

    this.logger.log('1. Расчет персональных методов.');
    const personalData =
      this.recommendationCalculatorService.calculatePersonalRecommendations(
        userEvents,
        personalStrategys,
        this.recLength,
      );

    this.logger.log('2. Расчет глобальных методов.');
    const globalData =
      this.recommendationCalculatorService.calculateGlobalRecommendations(
        userEvents,
        globalStrategys,
        this.recLength,
      );

    // разделяем настройки на персональные и стандартные
    const { personalConfigs, fallbackConfigs } =
      this.separateSonfigs(activeConfigs);

    this.logger.log('3. Агрегация методов.');
    const aggregateStart = performance.now();
    const aggregatedPersonalRecs =
      this.pipelineEngine.aggregatePersonalStrategys(
        this.recLength,
        personalConfigs,
        personalData,
      );

    const aggregateGlobalRecs = this.pipelineEngine.aggregateFallbacks(
      this.recLength,
      fallbackConfigs,
      globalData,
    );
    const aggregateEnd = performance.now();
    this.logger.debug(
      `Время агрегации: ${(aggregateEnd - aggregateStart) / 1000} секунд`,
    );

    const saveStart = performance.now();
    this.logger.log('4. Сохранение.');
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

  private async cleanupInactiveSettings(ids: string[]) {
    if (ids.length === 0) return;
    this.logger.debug(`${ELogHandler.DISABLED_SETTINGS_FOUND}: ${ids.length}`);
    await this.writer.deleteRecommendationsBySettingIds(ids);
    this.logger.log(ELogHandler.CLEANING_REC_COMPLETE);
  }

  private validateStrategies(configs: RecommendationSetting[]) {
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

    this.logger.debug('personal strategis:', personalStrategyNames);
    this.logger.debug('global strategis:', fallbackStrategyNames);

    return {
      personalStrategys: Array.from(personalStrategyNames),
      globalStrategys: Array.from(fallbackStrategyNames),
    };
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
      await this.writer.saveBatch(batchData);
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
