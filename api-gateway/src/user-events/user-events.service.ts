import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEvent } from './entities/user-event.entity';
import { UserEventDto } from './dto/user-event.dto';
import { EventTypesService } from 'src/event-types/event-types.service';
import { REST_STATUS } from 'src/common/util/rest-message-handler.util';
import { ERR_USER_EVENTS } from 'src/common/util/err-handler.util';

@Injectable()
export class UserEventService {
  constructor(
    @InjectRepository(UserEvent)
    private eventsRepository: Repository<UserEvent>,
    private readonly eventTypesService: EventTypesService,
  ) {}

  async create(dto: UserEventDto) {
    const eventType = (await this.eventTypesService.findById(dto.user_id)).data;

    if (!eventType) {
      throw new NotFoundException(
        `${ERR_USER_EVENTS.TYPE_NOT_FOUND} with id: ${dto.user_id}`,
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
      message: REST_STATUS.LOG_CREATED,
      data: savedEvent,
    };
  }

  findAll(limit: number = 50) {
    const events = this.eventsRepository.find({ take: limit });

    return {
      code: HttpStatus.OK,
      message: REST_STATUS.SUCCESS,
      data: events,
    };
  }
}
