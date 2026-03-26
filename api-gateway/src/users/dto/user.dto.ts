import { IsEnum, IsOptional } from 'class-validator';
import { UserRole } from 'src/common/interface/recommendation.interface';

export class UserDto {
  username: string;
  @IsOptional()
  @IsEnum(UserRole, { each: true })
  roles?: UserRole[] = [UserRole.CUSTOMER];
}
