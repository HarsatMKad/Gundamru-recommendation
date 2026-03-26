import { Injectable } from '@nestjs/common';
import { BatchWriter } from './batch-writer.service';
import { Logger } from '@nestjs/common';
import { RecommendationInput } from '../common/interface/recommendation.interface';
import { RecommendationSettingsService } from 'src/recommendation-settings/recommendation-settings.service';
import { PythonEngineClient } from './python-engine.client';
import { PipelineEngine } from './pipeline-engine.service';
import { UserIdsProvider } from './user-ids.provider';
import { AVAILABLE_STRATEGIES } from 'src/common/config/strategies.config';
import { StrategyScope } from 'src/common/config/strategies.config';
import { LOG_HANDLER } from 'src/common/util/log-handler.util';
import { WARN_REC_SYSTEM } from 'src/common/util/err-handler.util';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { RecommenderSetting } from 'src/recommendation-settings/entities/settings.entity';
import { RecommendationService } from 'src/recommendation/recommendations.service';
import { CronJob } from 'cron';
import {
  PythonPersonalResults,
  PythonGlobalResults,
} from '../common/interface/recommendation.interface';

@Injectable()
export class RecommenderOrchestrator {
  private readonly logger = new Logger(RecommenderOrchestrator.name);
  constructor(
    private readonly writer: BatchWriter,
    private readonly userIdsProvider: UserIdsProvider,
    private readonly settingsService: RecommendationSettingsService,
    private readonly recommendationService: RecommendationService,
    private readonly pythonClient: PythonEngineClient,
    private readonly pipelineEngine: PipelineEngine,
    private configService: ConfigService,
    private schedulerRegistry: SchedulerRegistry,
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
    const [validUserIds, activeConfigs, inactiveRecIds] = await Promise.all([
      this.userIdsProvider.getValidUserIds(),
      this.settingsService.getActiveConfigs().then((r) => r.data),
      this.recommendationService.getInactiveRecommendationSettingIds(),
    ]);
    // Очистка устаревших данных
    await this.cleanupInactiveSettings(inactiveRecIds);

    // Валидация стратегий
    this.validateStrategies(activeConfigs);

    // Генерация и сохранение
    await this.generateAndSaveRecommendations(validUserIds, activeConfigs);
    this.logger.log(LOG_HANDLER.REC_GENERATION_STOP);
  }

  private async cleanupInactiveSettings(ids: string[]) {
    if (ids.length === 0) return;
    this.logger.log(`${LOG_HANDLER.DISABLED_SETTINGS_FOUND}: ${ids.length}`);
    await this.writer.deleteRecommendationsBySettingIds(ids);
    this.logger.log(LOG_HANDLER.CLEANING_REC_COMPLETE);
  }

  private validateStrategies(configs: RecommenderSetting[]) {
    const personal = Array.from(
      new Set(
        configs.flatMap(
          (c) => c.personal_methods?.map((m) => m.strategy) || [],
        ),
      ),
    );
    const global = Array.from(
      new Set(
        configs.map((c) => c.fallback_strategy).filter((s): s is string => !!s),
      ),
    );

    const check = (list: string[], scope: StrategyScope) => {
      for (const strat of list) {
        const def = AVAILABLE_STRATEGIES.find((s) => s.name === strat);
        if (!def || def.scope !== scope) {
          this.logger.warn(
            `${WARN_REC_SYSTEM.NOT_STRATEGY_OR_SCOPE}: ${strat}`,
          );
        }
      }
    };

    this.logger.log('personal strategis:', personal);
    this.logger.log('global strategis:', global);

    check(personal, StrategyScope.PERSONAL);
    check(global, StrategyScope.GLOBAL);
  }

  private async generateAndSaveRecommendations(
    userIds: string[],
    configs: RecommenderSetting[],
  ) {
    const personalConfigs = configs.filter(
      (c) => c.personal_methods?.length > 0,
    );
    const fallbackConfigs = configs.filter((c) => c.fallback_strategy);

    const personalStrategies = Array.from(
      new Set(
        configs.flatMap(
          (c) => c.personal_methods?.map((m) => m.strategy) || [],
        ),
      ),
    );
    const fallbackStrategies = Array.from(
      new Set(
        configs.map((c) => c.fallback_strategy).filter((s): s is string => !!s),
      ),
    );

    const [personalData, globalData] = await Promise.all([
      this.pythonClient.fetchPersonalStrategyResults(
        personalStrategies,
        userIds,
      ),
      this.pythonClient.fetchGlobalStrategyResults(fallbackStrategies),
    ]);

    await Promise.all([
      this.savePersonalRecs(personalConfigs, userIds, personalData),
      this.saveFallbackRecs(fallbackConfigs, globalData),
    ]);
  }

  private async savePersonalRecs(
    configs: RecommenderSetting[],
    userIds: string[],
    personalData: PythonPersonalResults,
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
    globalData: PythonGlobalResults,
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
