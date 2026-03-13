import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { EventTypesService } from './event-types.service';
import { CreateEventTypeDto } from './dto/create_event-type.dto';
import { UpdateEventTypeDto } from './dto/update_event-type.dto';

@Controller('event-types')
export class EventTypesController {
  constructor(private readonly service: EventTypesService) {}

  @Get()
  getAll() {
    return this.service.findAll();
  }

  @Post()
  create(@Body() dto: CreateEventTypeDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() dto: UpdateEventTypeDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.service.remove(id);
  }
}
