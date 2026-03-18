import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEvent } from '../entities/user-event.entity';
import { EventTypesService } from 'src/event-types/event-types.service';
import { LOG_HANDLER } from 'src/common/util/log-handler.util';

@Injectable()
export class CleanupService {
  private readonly logger = new Logger(CleanupService.name);

  constructor(
    @InjectRepository(UserEvent)
    private eventsRepository: Repository<UserEvent>,
    private readonly eventTypeService: EventTypesService,
  ) {}

  @Cron('0 3 * * *') // запуск каждый день в 3 часа ночи
  async handleCleanup() {
    this.logger.log(LOG_HANDLER.CLEANUP_START);

    const eventTypes = await this.eventTypeService.findAll();

    for (const type of eventTypes.data) {
      const cutOffDate = new Date();
      cutOffDate.setDate(cutOffDate.getDate() - type.retention_days);

      const deleteResult = await this.eventsRepository
        .createQueryBuilder()
        .delete()
        .from(UserEvent)
        .where('event_type_id = :typeId', { typeId: type.id })
        .andWhere('timestamp < :cutOffDate', { cutOffDate })
        .execute();

      this.logger.log(
        `${LOG_HANDLER.DELETED_RECODS}: ${deleteResult.affected}; types: ${type.name}.`,
      );
    }

    this.logger.log(LOG_HANDLER.CLEANUP_STOP);
  }
}
