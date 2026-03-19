import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { EventTypesService } from './event-types.service';
import { CreateEventTypeDto } from './dto/create_event-type.dto';
import { UpdateEventTypeDto } from './dto/update_event-type.dto';
import { PARAMS } from 'src/common/util/endpoint-handler.util';

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

  @Patch(`:${PARAMS.ID}`)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  update(@Param(PARAMS.ID) id: number, @Body() dto: UpdateEventTypeDto) {
    return this.service.update(id, dto);
  }

  @Delete(`:${PARAMS.ID}`)
  remove(@Param(PARAMS.ID) id: number) {
    return this.service.remove(id);
  }
}
