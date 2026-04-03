import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { FindEventsQueryDto } from './dto/find-events.dto';
import { UserEvent } from 'src/database/entities/user-event.entity';
import { UserEventDto } from './dto/user-event.dto';

@Injectable()
export class UserEventService {
  constructor(
    @InjectRepository(UserEvent)
    private eventsRepository: Repository<UserEvent>,
  ) {}

  async create(dto: UserEventDto) {
    const existingEvent = await this.eventsRepository.findOneBy({
      user_id: dto.user_id,
      product_id: dto.product_id,
      event_type_id: dto.event_type_id,
    });

    if (existingEvent) {
      existingEvent.count = existingEvent.count + 1;
      existingEvent.timestamp = new Date();
      return await this.eventsRepository.save(existingEvent);
    } else {
      const newEvent = this.eventsRepository.create({
        user_id: dto.user_id,
        product_id: dto.product_id,
        event_type_id: dto.event_type_id,
        timestamp: new Date(),
      });
      return await this.eventsRepository.save(newEvent);
    }
  }

  async findBy(dto: FindEventsQueryDto) {
    const where = Object.fromEntries(
      Object.entries({
        id: dto.id,
        user_id: dto.userId,
        product_id: dto.productId,
        event_type_id: dto.eventTypeId,
      }).filter(([value]) => value !== undefined),
    );

    const queryOptions: FindManyOptions<UserEvent> = {
      where: Object.keys(where).length > 0 ? where : undefined,
    };

    if (dto.limit) {
      queryOptions.take = dto.limit;
    }

    const result = await this.eventsRepository.find(queryOptions);

    return {
      length: result.length,
      result,
    };
  }

  async getRelevantUserEvents(
    userIds: string[],
    productIds: string[],
  ): Promise<UserEvent[]> {
    const queryBuilder = this.eventsRepository
      .createQueryBuilder('ue')
      .innerJoinAndSelect('ue.eventType', 'et')
      .where('et.is_active = :isActive', { isActive: true });
    if (userIds.length > 0) {
      queryBuilder.andWhere('ue.user_id IN (:...userIds)', { userIds });
    }
    if (productIds.length > 0) {
      queryBuilder.andWhere('ue.product_id IN (:...productIds)', {
        productIds,
      });
    }
    return await queryBuilder.getMany();
  }

  async deleteOldEvents(typeId: string, cutOffDate: Date): Promise<number> {
    const deleteResult = await this.eventsRepository
      .createQueryBuilder()
      .delete()
      .from(UserEvent)
      .where('event_type_id = :typeId', { typeId })
      .andWhere('timestamp < :cutOffDate', { cutOffDate })
      .execute();
    return deleteResult.affected ?? 0;
  }
}
