import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/database/entities/user.entity';
import { I_USERS_SERVICE } from 'src/common/interface/entites.interface';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [
    {
      provide: I_USERS_SERVICE,
      useClass: UsersService,
    },
  ],
  exports: [
    {
      provide: I_USERS_SERVICE,
      useClass: UsersService,
    },
  ],
})
export class UsersModule {}
