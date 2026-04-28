import { Controller, Post, Body, Get, Query, Param } from '@nestjs/common';
import { UserEventService } from './user-events.service';
import { UserEventArrayDto } from './dto/user-event.dto';
import { FindEventsQueryDto } from './dto/find-events.dto';
import { AnalyticsService } from './analytics.service';
import { StatisticsRequestDto } from './dto/analytics-query.dto';
import { UserEventNames } from 'src/common/enum/UserEventName.enum';

@Controller('api/user-events')
export class UserEventsController {
  constructor(
    private readonly userEventService: UserEventService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  @Post()
  logArray(@Body() userEvents: UserEventArrayDto) {
    return this.userEventService.createAndUpdateFromArray(userEvents.events);
  }

  @Get()
  getQuery(@Query() dto: FindEventsQueryDto) {
    return this.userEventService.findBy(dto);
  }

  @Get('analytics/:eventType')
  getProductAnalytics(
    @Param('eventType') eventType: UserEventNames,
    @Query() query: StatisticsRequestDto,
  ) {
    return this.analyticsService.getStatisticsWithTrend(eventType, query);
  }
}
