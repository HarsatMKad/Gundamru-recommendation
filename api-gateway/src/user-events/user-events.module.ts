import { Module } from '@nestjs/common';
import { UserEventService } from './user-events.service';
import { UserEventsController } from './user-events.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { CleanupService } from './cleanup.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEvent } from 'src/database/entities/user-event.entity';
import { AnalyticsService } from './analytics.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEvent]), ScheduleModule.forRoot()],
  providers: [UserEventService, AnalyticsService, CleanupService],
  controllers: [UserEventsController],
  exports: [UserEventService],
})
export class UserEventsModule {}
