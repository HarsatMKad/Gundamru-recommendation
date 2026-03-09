import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PipelineEngine } from './pipeline-engine.service';
import { BatchWriter } from './batch-writer.service';
import { Logger } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { RecommendationInput } from './batch-writer.service';
import { RecommendationSettingsService } from 'src/recommendation-settings/recommendation-settings.service';
import { CronExpression } from '@nestjs/schedule';

@Injectable()
export class RecommenderOrchestrator {
  private readonly logger = new Logger(RecommenderOrchestrator.name);

  constructor(
    private readonly engine: PipelineEngine,
    private readonly writer: BatchWriter,
    private readonly usersService: UsersService,
    private readonly settingsService: RecommendationSettingsService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  //@Cron('0 */2 * * * *') // каждые 2 минуты
  async handleCron() {
    this.logger.log('Начат процесс генерации рекомендаций.');
    const batchData: RecommendationInput[] = [];
    const users = await this.usersService.findAll();
    const activeConfigs = await this.settingsService.getActiveConfigs();
    const inactiveRecIds = await this.settingsService.getInactiveSettingIds();

    if (inactiveRecIds.length > 0) {
      this.logger.log(`${inactiveRecIds.length} отключенных настроек. Очистка`);
      await this.writer.deleteRecommendationsBySettingIds(inactiveRecIds);
      this.logger.log('Очистка завершена.');
    }

    for (const config of activeConfigs) {
      const context = config.target_context;
      for (const user of users) {
        try {
          const recs = await this.engine.runForContext(user.id, context);
          batchData.push({
            user_id: user.id,
            setting_id: config.id,
            recommended_skus: recs,
            generated_at: new Date(),
          });
        } catch (err) {
          this.logger.error(
            `Ошибка при расчете ${context} для пользователя ${user.id}: ${err}`,
          );
        }
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
