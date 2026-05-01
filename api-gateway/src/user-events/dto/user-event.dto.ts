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
  userId!: string;

  @IsUUID()
  @IsNotEmpty()
  productId!: string;

  @IsEnum(UserEventNames)
  @IsNotEmpty()
  eventName!: UserEventNames;
}
