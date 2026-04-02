import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/database/entities/user.entity';
import { UserRole } from 'src/common/enum/UserRole.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findWithRoleFilter(includeRole: UserRole, excludeRole: UserRole) {
    return this.usersRepository
      .createQueryBuilder('user')
      .where(':role = ANY(user.roles)', { role: includeRole })
      .andWhere('NOT (:excludeRole = ANY(user.roles))', {
        excludeRole: excludeRole,
      })
      .getMany();
  }

  async findAll() {
    return await this.usersRepository.find();
  }
}
