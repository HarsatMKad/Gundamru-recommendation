import { Controller, Post, Body, Get } from '@nestjs/common';
import { UserEventService } from './user-events.service';
import { UserEventDto } from './dto/user-event.dto';
import { UserEvent } from './entities/user-event.entity';

@Controller('user-events')
export class UserEventsController {
  constructor(private readonly userEventService: UserEventService) {}

  @Post('log')
  log(@Body() userEventDto: UserEventDto): Promise<UserEvent> {
    return this.userEventService.logEvent(userEventDto);
  }

  @Get()
  findAll() {
    return this.userEventService.findAll();
  }
}
