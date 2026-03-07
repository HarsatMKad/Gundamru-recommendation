import { Module } from '@nestjs/common';
import { UserEventService } from './user-events.service';
import { UserEventsController } from './user-events.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { CleanupService } from './services/cleanup.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEvent } from './entities/user-event.entity';
import { ProductsModule } from 'src/products/products.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEvent]),
    ScheduleModule.forRoot(),
    ProductsModule,
    UsersModule,
  ],
  providers: [UserEventService, CleanupService],
  controllers: [UserEventsController],
})
export class UserEventsModule {}
