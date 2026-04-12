import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { UserEventNames } from 'src/common/enum/UserEventName.enum';

export class UserEventDto {
  @IsString()
  @IsNotEmpty()
  user_id!: string;

  @IsString()
  @IsNotEmpty()
  product_id!: string;

  @IsEnum(UserEventNames)
  @IsNotEmpty()
  eventName!: UserEventNames;
}
