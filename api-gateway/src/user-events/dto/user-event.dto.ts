import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UserEventNames } from 'src/common/enum/UserEventName.enum';

export class UserEventArrayDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserEventDto)
  events!: UserEventDto[];
}

export class UserEventDto {
  @IsUUID()
  @IsNotEmpty()
  user_id!: string;

  @IsUUID()
  @IsNotEmpty()
  product_id!: string;

  @IsEnum(UserEventNames)
  @IsNotEmpty()
  eventName!: UserEventNames;
}
