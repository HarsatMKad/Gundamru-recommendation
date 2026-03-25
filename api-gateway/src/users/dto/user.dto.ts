import { IsEnum, IsOptional } from 'class-validator';
import { UserRole } from 'src/common/interface/recommendation.interface';

export class UserDto {
  id: number;
  username: string;
  @IsOptional()
  @IsEnum(UserRole, { each: true })
  roles?: UserRole[] = [UserRole.CUSTOMER];
}
