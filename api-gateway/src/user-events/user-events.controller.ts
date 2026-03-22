import { Controller, Post, Body, Get } from '@nestjs/common';
import { UserEventService } from './user-events.service';
import { UserEventDto } from './dto/user-event.dto';
import { USER_EVENTS_ENDPOINTS } from 'src/common/util/request-param-handler.util';

@Controller('user-events')
export class UserEventsController {
  constructor(private readonly userEventService: UserEventService) {}

  @Post(USER_EVENTS_ENDPOINTS.LOG)
  log(@Body() userEventDto: UserEventDto) {
    return this.userEventService.create(userEventDto);
  }

  @Get()
  findAll() {
    return this.userEventService.findAll();
  }
}
