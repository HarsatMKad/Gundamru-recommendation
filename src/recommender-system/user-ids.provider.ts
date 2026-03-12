import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class UserIdsProvider {
  constructor(private readonly usersService: UsersService) {}

  async getValidUserIds(): Promise<number[]> {
    const users = await this.usersService.findAll();
    return users.map((u) => u.id);
  }
}
