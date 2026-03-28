import { Controller, Post, Body, Get } from '@nestjs/common';
import { UserEventService } from './user-events.service';
import { UserEventDto } from './dto/user-event.dto';

@Controller('user-events')
export class UserEventsController {
  constructor(private readonly userEventService: UserEventService) {}

  @Post('log')
  log(@Body() userEventDto: UserEventDto) {
    return this.userEventService.create(userEventDto);
  }

  @Get()
  findAll() {
    return this.userEventService.findAll();
  }
}
