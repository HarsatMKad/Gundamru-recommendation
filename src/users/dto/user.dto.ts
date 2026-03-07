import { IsNotEmpty, IsIn } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class UserDto {
  id: number;
  username: string;
  @IsIn([UserRole.ADMIN, UserRole.CUSTOMER])
  @IsNotEmpty()
  roles: UserRole;
}
