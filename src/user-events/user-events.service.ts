import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEvent } from './entities/user-event.entity';
import { UserEventDto } from './dto/user-event.dto';
import { EventTypesService } from 'src/event-types/event-types.service';

@Injectable()
export class UserEventService {
  constructor(
    @InjectRepository(UserEvent)
    private eventsRepository: Repository<UserEvent>,
    private readonly eventTypesService: EventTypesService,
  ) {}

  async create(dto: UserEventDto): Promise<UserEvent> {
    const eventType = await this.eventTypesService.findByName(
      dto.event_type_name,
    );

    if (!eventType) {
      throw new NotFoundException(
        `Тип события ${dto.event_type_name} не найден`,
      );
    }

    const event = this.eventsRepository.create({
      user_id: dto.user_id,
      product_id: dto.product_id,
      event_type_id: eventType.id,
      timestamp: dto.timestamp || new Date(),
    });

    return this.eventsRepository.save(event);
  }

  findAll() {
    return this.eventsRepository.find({
      take: 50,
    });
  }
}
