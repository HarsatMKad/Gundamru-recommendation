import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { BatchWriter } from './batch-writer.service';
import { Logger } from '@nestjs/common';
import { RecommendationInput } from '../common/interface/recommendation.interface';
import { RecommendationSettingsService } from 'src/recommendation-settings/recommendation-settings.service';
//import { CronExpression } from '@nestjs/schedule';
import { PythonEngineClient } from './python-engine.client';
import { PipelineEngine } from './pipeline-engine.service';
import { UserIdsProvider } from './user-ids.provider';
import { AVAILABLE_STRATEGIES } from 'src/common/config/strategies.config';
import { StrategyScope } from 'src/common/config/strategies.config';
import { LOG_HANDLER } from 'src/common/util/log-handler.util';
import { WARN_REC_SYSTEM } from 'src/common/util/err-handler.util';

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
    this.logger.log(LOG_HANDLER.REC_GENERATION_START);
    const validUserIds = await this.userIdsProvider.getValidUserIds();
    const activeConfigs = (await this.settingsService.getActiveConfigs()).data;
    const inactiveRecIds = (await this.settingsService.getInactiveSettingIds())
      .data;

    if (inactiveRecIds.length > 0) {
      this.logger.log(
        `${LOG_HANDLER.DISABLED_SETTINGS_FOUND}: ${inactiveRecIds.length}`,
      );
      await this.writer.deleteRecommendationsBySettingIds(inactiveRecIds);
      this.logger.log(LOG_HANDLER.CLEANING_REC_COMPLETE);
    }

    const personalConfigs = activeConfigs.filter(
      (c) => c.personal_methods?.length > 0,
    );
    const fallbackConfigs = activeConfigs.filter((c) => c.fallback_strategy);

    const personalStrategies = Array.from(
      new Set(
        personalConfigs.flatMap((c) =>
          c.personal_methods.map((m) => m.strategy),
        ),
      ),
    );

    const fallbackStrategies = Array.from(
      new Set(
        fallbackConfigs
          .map((c) => c.fallback_strategy)
          .filter((s): s is string => !!s),
      ),
    );

    for (const strat of personalStrategies) {
      const def = AVAILABLE_STRATEGIES.find((s) => s.name === strat);
      if (!def || def.scope !== StrategyScope.PERSONAL) {
        this.logger.warn(`${WARN_REC_SYSTEM.NOT_STRATEGY_OR_SCOPE}: ${strat}`);
      }
    }

    for (const strat of fallbackStrategies) {
      const def = AVAILABLE_STRATEGIES.find((s) => s.name === strat);
      if (!def || def.scope !== StrategyScope.GLOBAL) {
        this.logger.warn(`${WARN_REC_SYSTEM.NOT_STRATEGY_OR_SCOPE}: ${strat}`);
      }
    }

    const [personalData, globalData] = await Promise.all([
      this.pythonClient.fetchPersonalStrategyResults(
        personalStrategies,
        validUserIds,
      ),
      this.pythonClient.fetchGlobalStrategyResults(fallbackStrategies),
    ]);

    const batchData: RecommendationInput[] = [];
    for (const config of personalConfigs) {
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
      await this.writer.saveBatch(batchData);
      this.logger.log(`${LOG_HANDLER.REC_SAVED}: ${batchData.length}`);
    } else {
      this.logger.log(LOG_HANDLER.REC_NO_SAVED);
    }

    for (const config of fallbackConfigs) {
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
    }
    this.logger.log(LOG_HANDLER.REC_GENERATION_STOP);
  }
}
