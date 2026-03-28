import { Injectable } from '@nestjs/common';
import { EventType } from 'src/database/entities/event-types.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateEventTypeDto } from './dto/create_event-type.dto';
import { UpdateEventTypeDto } from './dto/update_event-type.dto';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { EErrEventType } from 'src/common/enum/ErrHandler.enum';
import { ERestStatus } from 'src/common/enum/Rest.enum';
import { HttpStatus } from '@nestjs/common';

@Injectable()
export class EventTypesService {
  constructor(
    @InjectRepository(EventType)
    private readonly repoEventTypes: Repository<EventType>,
  ) {}

  async findAll() {
    const items = await this.repoEventTypes.find();
    return {
      code: HttpStatus.OK,
      message: ERestStatus.SUCCESS,
      data: items,
    };
  }

  async findById(id: string) {
    const item = await this.repoEventTypes.findOneBy({ id });

    if (!item) {
      throw new NotFoundException(
        `${EErrEventType.EVENT_TYPE_NOT_FOUND}: ${id}`,
      );
    }

    return {
      code: HttpStatus.OK,
      message: ERestStatus.SUCCESS,
      data: item,
    };
  }

  async create(dto: CreateEventTypeDto) {
    const existing = await this.repoEventTypes.findOneBy({ name: dto.name });

    if (existing) {
      throw new ConflictException(
        `${EErrEventType.EVENT_TYPE_EXISTED}: ${dto.name}`,
      );
    }

    const newType = this.repoEventTypes.create(dto);
    const saved = await this.repoEventTypes.save(newType);

    return {
      code: HttpStatus.CREATED,
      message: ERestStatus.SUCCESS,
      data: saved,
    };
  }

  async update(id: string, dto: UpdateEventTypeDto) {
    const existing = await this.repoEventTypes.findOneBy({ id });

    if (!existing) {
      throw new NotFoundException(
        `${EErrEventType.EVENT_TYPE_NOT_FOUND}: ${id}`,
      );
    }

    await this.repoEventTypes.update(id, dto);
    const updated = await this.repoEventTypes.findOneBy({ id });

    return {
      code: HttpStatus.OK,
      message: ERestStatus.UPDATED,
      data: updated,
    };
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
    return {
      code: HttpStatus.OK,
      message: ERestStatus.SUCCESS,
      data: {
        deleted: true,
      },
    };
  }
}
