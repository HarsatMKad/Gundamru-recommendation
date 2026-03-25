import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { UserRole } from 'src/common/interface/recommendation.interface';

@Injectable()
export class UserIdsProvider {
  constructor(private readonly usersService: UsersService) {}

  async getValidUserIds(): Promise<number[]> {
    const users = await this.usersService.findByRole(UserRole.CUSTOMER);
    return users.map((u) => u.id);
  }
}
