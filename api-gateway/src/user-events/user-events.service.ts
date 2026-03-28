import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEvent } from 'src/database/entities/user-event.entity';
import { UserEventDto } from './dto/user-event.dto';
import { EventTypesService } from 'src/event-types/event-types.service';
import { EErrUserEvents } from 'src/common/enum/ErrHandler.enum';
import { ERestStatus } from 'src/common/enum/Rest.enum';

@Injectable()
export class UserEventService {
  constructor(
    @InjectRepository(UserEvent)
    private eventsRepository: Repository<UserEvent>,
    private readonly eventTypesService: EventTypesService,
  ) {}

  async create(dto: UserEventDto) {
    const eventType = (await this.eventTypesService.findById(dto.event_type_id))
      .data;

    if (!eventType) {
      throw new NotFoundException(
        `${EErrUserEvents.TYPE_NOT_FOUND} with id: ${dto.user_id}`,
      );
    }

    const event = this.eventsRepository.create({
      user_id: dto.user_id,
      product_id: dto.product_id,
      event_type_id: eventType.id,
      timestamp: dto.timestamp || new Date(),
    });

    const savedEvent = await this.eventsRepository.save(event);

    return {
      code: HttpStatus.CREATED,
      message: ERestStatus.LOG_CREATED,
      data: savedEvent,
    };
  }

  async findAll(limit: number = 50) {
    const events = await this.eventsRepository.find({ take: limit });

    return {
      code: HttpStatus.OK,
      message: ERestStatus.SUCCESS,
      data: events,
    };
  }
  async getRelevantUserEvents(userIds: string[]): Promise<UserEvent[]> {
    const queryBuilder = this.eventsRepository.createQueryBuilder('ue');
    queryBuilder
      .innerJoinAndSelect('ue.eventType', 'et')
      .where('et.is_active = :isActive', { isActive: true });
    if (userIds.length > 0) {
      queryBuilder.andWhere('ue.user_id IN (:...userIds)', { userIds });
    }
    return await queryBuilder.getMany();
  }
}
