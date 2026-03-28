import { Module } from '@nestjs/common';
import { EventTypesController } from './event-types.controller';
import { EventTypesService } from './event-types.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventType } from 'src/database/entities/event-types.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EventType])],
  controllers: [EventTypesController],
  providers: [EventTypesService],
  exports: [EventTypesService, TypeOrmModule],
})
export class EventTypesModule {}
