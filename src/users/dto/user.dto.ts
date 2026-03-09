import { IsEnum, IsOptional } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class UserDto {
  id: number;
  username: string;
  @IsEnum(UserRole)
  @IsOptional()
  roles?: UserRole = UserRole.CUSTOMER;
}
