import { Injectable, Logger } from '@nestjs/common';
import { EventTypesService } from 'src/event-types/event-types.service';
import { ELogHandler } from 'src/common/enum/LogHandler.enum';
import { ConfigService } from '@nestjs/config';
import { ICronConfig } from 'src/common/interface/config.interface';
import { EConfigKey } from 'src/common/enum/ConfigKey.enum';
import { SchedulerRegistry } from '@nestjs/schedule';
import { UserEventService } from '../user-events.service';
import { CronJob } from 'cron';

@Injectable()
export class CleanupService {
  private readonly logger = new Logger(CleanupService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly eventTypeService: EventTypesService,
    private readonly userEventService: UserEventService,
  ) {}

  onModuleInit() {
    // запуск каждый день по расписанию cleanupTime или в 3ч ночи по мск
    const cronTime =
      this.configService.get<ICronConfig>(EConfigKey.cron)?.cleanupTime ??
      '0 3 * * *';

    const job = new CronJob(
      cronTime,
      () => this.handleCleanup(),
      null,
      false,
      'Europe/Moscow',
    );
    this.schedulerRegistry.addCronJob('cleanup_job', job);
    job.start();
  }

  async handleCleanup() {
    this.logger.log(ELogHandler.CLEANUP_START);
    const eventTypes = await this.eventTypeService.findAll();

    for (const type of eventTypes) {
      const cutOffDate = new Date();
      cutOffDate.setDate(cutOffDate.getDate() - type.retention_days);

      const deleteResult = await this.userEventService.deleteOldEvents(
        type.id,
        cutOffDate,
      );

      this.logger.log(
        `${ELogHandler.DELETED_RECODS}: ${deleteResult}; types: ${type.name}.`,
      );
    }

    this.logger.log(ELogHandler.CLEANUP_STOP);
  }
}
