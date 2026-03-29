import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { UserEventService } from './user-events.service';
import { UserEventDto } from './dto/user-event.dto';
import { FindEventsQueryDto } from './dto/find-events.dto';
import { ResponseMessage } from 'src/common/const/ResponseMessage.const';

@Controller('user-events')
export class UserEventsController {
  constructor(private readonly userEventService: UserEventService) {}

  @Post('log')
  log(@Body() userEventDto: UserEventDto) {
    return this.userEventService.create(userEventDto);
  }

  @Get()
  @ResponseMessage('События пользователей получены')
  getQuery(@Query() dto: FindEventsQueryDto) {
    return this.userEventService.findBy(dto);
  }
}
