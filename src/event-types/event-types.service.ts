import { Injectable } from '@nestjs/common';
import { EventType } from './entities/event-types.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateEventTypeDto } from './dto/create_event-type.dto';
import { UpdateEventTypeDto } from './dto/update_event-type.dto';

@Injectable()
export class EventTypesService {
  constructor(
    @InjectRepository(EventType)
    private readonly repo: Repository<EventType>,
  ) {}

  async findAll() {
    return await this.repo.find();
  }

  async findByName(name: string) {
    return await this.repo.findOneBy({ name });
  }

  async create(dto: CreateEventTypeDto) {
    const newType = this.repo.create(dto);
    return await this.repo.save(newType);
  }

  async update(id: number, dto: UpdateEventTypeDto) {
    await this.repo.update(id, dto);
    return await this.repo.findOneBy({ id });
  }

  async remove(id: number) {
    return await this.repo.delete(id);
  }
}
