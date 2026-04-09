import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/database/entities/user.entity';
import { UserRole } from 'src/common/enum/UserRole.enum';
import { IUsersService } from 'src/common/interface/entites.interface';

@Injectable()
export class UsersService implements IUsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findWithRoleFilter(
    includeRole: UserRole,
    excludeRole: UserRole,
  ): Promise<User[]> {
    return this.usersRepository
      .createQueryBuilder('user')
      .where(':role = ANY(user.roles)', { role: includeRole })
      .andWhere('NOT (:excludeRole = ANY(user.roles))', {
        excludeRole: excludeRole,
      })
      .getMany();
  }
}
