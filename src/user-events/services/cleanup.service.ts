import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEvent, UserEventType } from '../entities/user-event.entity';

@Injectable()
export class CleanupService {
  private readonly logger = new Logger(CleanupService.name);

  constructor(
    @InjectRepository(UserEvent)
    private eventsRepository: Repository<UserEvent>,
  ) {}

  @Cron('0 3 * * *') // запуск каждый день в 3 часа ночи
  async handleCleanup() {
    this.logger.log('Начат процесс очистки старых данных UserEvents.');

    const viewDeleteResult = await this.eventsRepository
      .createQueryBuilder()
      .delete()
      .from(UserEvent)
      .where('event_type != :purchase', { purchase: UserEventType.PURCHASE })
      .andWhere("timestamp < NOW() - INTERVAL '30 days'")
      .execute();

    this.logger.log(
      `Удалено ${viewDeleteResult.affected} записей просмотра/клика (до 30 дней).`,
    );

    const purchaseDeleteResult = await this.eventsRepository
      .createQueryBuilder()
      .delete()
      .from(UserEvent)
      .where('event_type = :purchase', { purchase: UserEventType.PURCHASE })
      .andWhere("timestamp < NOW() - INTERVAL '1 year'")
      .execute();

    this.logger.log(
      `Удалено ${purchaseDeleteResult.affected} записей покупок (до 1 года).`,
    );

    this.logger.log('Процесс очистки завершен.');
  }
}
