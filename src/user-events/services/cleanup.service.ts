import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEvent } from '../entities/user-event.entity';
import { EventTypesService } from 'src/event-types/event-types.service';

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
    this.logger.log('Начат процесс очистки старых данных UserEvents.');

    const eventTypes = await this.eventTypeService.findAll();

    for (const type of eventTypes) {
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
        `Удалено ${deleteResult.affected} записей типа: ${type.name}.`,
      );
    }

    this.logger.log('Процесс очистки завершен.');
  }
}
