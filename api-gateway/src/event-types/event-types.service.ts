import { Injectable } from '@nestjs/common';
import { EventType } from './entities/event-types.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateEventTypeDto } from './dto/create_event-type.dto';
import { UpdateEventTypeDto } from './dto/update_event-type.dto';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { ERR_EVENT_TYPE } from 'src/common/util/err-handler.util';
import { REST_STATUS } from 'src/common/util/rest-message-handler.util';
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
      message: REST_STATUS.SUCCESS,
      data: items,
    };
  }

  async findById(id: string) {
    const item = await this.repoEventTypes.findOneBy({ id });

    if (!item) {
      throw new NotFoundException(
        `${ERR_EVENT_TYPE.EVENT_TYPE_NOT_FOUND}: ${id}`,
      );
    }

    return {
      code: HttpStatus.OK,
      message: REST_STATUS.SUCCESS,
      data: item,
    };
  }

  async create(dto: CreateEventTypeDto) {
    const existing = await this.repoEventTypes.findOneBy({ name: dto.name });

    if (existing) {
      throw new ConflictException(
        `${ERR_EVENT_TYPE.EVENT_TYPE_EXISTED}: ${dto.name}`,
      );
    }

    const newType = this.repoEventTypes.create(dto);
    const saved = await this.repoEventTypes.save(newType);

    return {
      code: HttpStatus.CREATED,
      message: REST_STATUS.SUCCESS,
      data: saved,
    };
  }

  async update(id: string, dto: UpdateEventTypeDto) {
    const existing = await this.repoEventTypes.findOneBy({ id });

    if (!existing) {
      throw new NotFoundException(
        `${ERR_EVENT_TYPE.EVENT_TYPE_NOT_FOUND}: ${id}`,
      );
    }

    await this.repoEventTypes.update(id, dto);
    const updated = await this.repoEventTypes.findOneBy({ id });

    return {
      code: HttpStatus.OK,
      message: REST_STATUS.UPDATED,
      data: updated,
    };
  }

  async remove(id: string) {
    const existing = await this.repoEventTypes.findOne({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(
        `${ERR_EVENT_TYPE.EVENT_TYPE_NOT_FOUND}: ${id}`,
      );
    }

    await this.repoEventTypes.delete({ id });
    return {
      code: HttpStatus.OK,
      message: REST_STATUS.SUCCESS,
      data: {
        deleted: true,
      },
    };
  }
}
