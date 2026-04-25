import { Injectable, Logger } from '@nestjs/common';
import { ELogHandler } from 'src/common/enum/LogHandler.enum';
import { ConfigService } from '@nestjs/config';
import { ICronConfig } from 'src/common/interface/config.interface';
import { EConfigKey } from 'src/common/enum/ConfigKey.enum';
import { SchedulerRegistry } from '@nestjs/schedule';
import { UserEventService } from '../user-events.service';
import { CronJob } from 'cron';
import { UserEventType } from 'src/common/class/UserEventType.class';

@Injectable()
export class CleanupService {
  private readonly logger = new Logger(CleanupService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly userEventService: UserEventService,
  ) {}

  onModuleInit() {
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
    const eventTypeList = UserEventType.getAllEvents();

    // удалять, если не актуально
    for (const type of eventTypeList) {
      const cutOffDate = new Date();
      cutOffDate.setDate(cutOffDate.getDate() - type.retentionDays);
      const timeBasedDeleted =
        await this.userEventService.deleteOldEventsForUsers(
          type.name,
          cutOffDate,
        );

      // удалять, если событий больше допустимого максимума на пользователя
      const maxBasedDeleted =
        await this.userEventService.deleteExcessEventsForUsers(
          type.name,
          type.maxForUser,
        );

      this.logger.log(
        `${ELogHandler.DELETED_RECODS}: ${timeBasedDeleted + maxBasedDeleted}. for types: ${type.name}.`,
      );
    }

    this.logger.log(ELogHandler.CLEANUP_STOP);
  }
}
