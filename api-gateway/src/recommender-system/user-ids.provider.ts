import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { UserRole } from 'src/common/enum/UserRole.enum';

@Injectable()
export class UserIdsProvider {
  constructor(private readonly usersService: UsersService) {}

  async getValidUserIds(): Promise<string[]> {
    const users = await this.usersService.findByRole(UserRole.CUSTOMER);
    return users.map((u) => u.id);
  }
}
