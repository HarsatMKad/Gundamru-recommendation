import { Injectable } from '@nestjs/common';
import { EventType } from 'src/database/entities/event-types.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateEventTypeDto } from './dto/create_event-type.dto';
import { UpdateEventTypeDto } from './dto/update_event-type.dto';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { EErrEventType } from 'src/common/enum/ErrHandler.enum';

@Injectable()
export class EventTypesService {
  constructor(
    @InjectRepository(EventType)
    private readonly repoEventTypes: Repository<EventType>,
  ) {}

  async findAll() {
    return await this.repoEventTypes.find();
  }

  async findById(id: string) {
    return await this.repoEventTypes.findOneBy({ id });
  }

  async create(dto: CreateEventTypeDto) {
    const existing = await this.repoEventTypes.findOneBy({ name: dto.name });

    if (existing) {
      throw new ConflictException(
        `${EErrEventType.EVENT_TYPE_EXISTED}: ${dto.name}`,
      );
    }

    const newType = this.repoEventTypes.create(dto);
    return await this.repoEventTypes.save(newType);
  }

  async update(id: string, dto: UpdateEventTypeDto) {
    const existing = await this.repoEventTypes.findOneBy({ id });

    if (!existing) {
      throw new NotFoundException(
        `${EErrEventType.EVENT_TYPE_NOT_FOUND}: ${id}`,
      );
    }

    await this.repoEventTypes.update(id, dto);
    return await this.repoEventTypes.findOneBy({ id });
  }

  async remove(id: string) {
    const existing = await this.repoEventTypes.findOne({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(
        `${EErrEventType.EVENT_TYPE_NOT_FOUND}: ${id}`,
      );
    }

    await this.repoEventTypes.delete({ id });
    return { deleted: true };
  }
}
