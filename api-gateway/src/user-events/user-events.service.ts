import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository, In } from 'typeorm';
import { FindEventsQueryDto } from './dto/find-events.dto';
import { UserEvent } from 'src/database/entities/user-event.entity';
import { UserEventDto } from './dto/user-event.dto';
import { UserEventType } from 'src/common/class/UserEventType.class';

@Injectable()
export class UserEventService {
  constructor(
    @InjectRepository(UserEvent)
    private eventsRepository: Repository<UserEvent>,
  ) {}

  async createAndUpdateFromArray(batchEvent: UserEventDto[]) {
    if (!batchEvent.length) {
      return [];
    }

    const eventCountMap = new Map<string, number>();
    for (const dto of batchEvent) {
      const key = `${dto.userId}|${dto.productId}|${dto.eventName}`;

      const existingEvent = await this.eventsRepository.findOneBy({
        userId: dto.userId,
        productId: dto.productId,
        eventTypeName: dto.eventName,
      });

      const count =
        eventCountMap.get(key) || 0 + (existingEvent ? existingEvent.count : 0);

      eventCountMap.set(key, count + 1);
    }

    const eventsToUpsert = Array.from(eventCountMap.entries())
      .map(([key, count]) => {
        const [userId, productId, eventTypeName] = key.split('|');
        if (UserEventType.isValidEvent(eventTypeName)) {
          return this.eventsRepository.create({
            userId,
            productId,
            eventTypeName,
            count,
            timestamp: new Date(),
          });
        }
      })
      .filter((event): event is UserEvent => event !== null);

    if (eventsToUpsert.length === 0) {
      return [];
    }

    const result = await this.eventsRepository
      .createQueryBuilder()
      .insert()
      .into(UserEvent)
      .values(eventsToUpsert)
      .orUpdate(
        ['count', 'timestamp'],
        ['user_id', 'product_id', 'event_type_name'],
      )
      .execute();

    return result.generatedMaps;
  }

  async findBy(dto: FindEventsQueryDto) {
    const where = Object.fromEntries(
      Object.entries({
        id: dto.id,
        user_id: dto.userId,
        product_id: dto.productId,
        event_type_name: dto.eventName,
      }).filter(([value]) => value !== undefined),
    );

    const queryOptions: FindManyOptions<UserEvent> = {
      where: Object.keys(where).length > 0 ? where : undefined,
    };

    if (dto.limit) {
      queryOptions.take = Number(dto.limit);
    }

    const result = await this.eventsRepository.find(queryOptions);

    return {
      length: result.length,
      result,
    };
  }

  async getRelevantUserEvents(productIds: string[]): Promise<UserEvent[]> {
    if (productIds.length === 0) {
      return [];
    }

    return this.eventsRepository.find({
      where: {
        productId: In(productIds),
      },
    });
  }

  async deleteOldEventsForUsers(
    typeName: string,
    cutOffDate: Date,
  ): Promise<number> {
    const deleteResult = await this.eventsRepository
      .createQueryBuilder()
      .delete()
      .from(UserEvent)
      .where('event_type_name = :typeName', { typeName })
      .andWhere('timestamp < :cutOffDate', { cutOffDate })
      .execute();
    return deleteResult.affected ?? 0;
  }

  async deleteExcessEventsForUsers(
    typeName: string,
    maxForUser: number,
  ): Promise<number> {
    const eventsToDelete = await this.eventsRepository
      .createQueryBuilder('event')
      .select('event.id')
      .where('event.event_type_name = :typeName', { typeName })
      .andWhere((qb) => {
        const subQuery = qb
          .subQuery()
          .select('event2.id')
          .from(UserEvent, 'event2')
          .where('event2.user_id = event.user_id')
          .andWhere('event2.event_type_name = :typeName', { typeName })
          .orderBy('event2.timestamp', 'DESC')
          .limit(maxForUser)
          .getQuery();
        return `event.id NOT IN (${subQuery})`;
      })
      .getMany();

    if (eventsToDelete.length === 0) return 0;

    const deleteResult = await this.eventsRepository
      .createQueryBuilder()
      .delete()
      .from(UserEvent)
      .where('id IN (:...ids)', { ids: eventsToDelete.map((e) => e.id) })
      .execute();

    return deleteResult.affected ?? 0;
  }
}
