import {
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { UserEventType } from '../entities/user-event.entity';

export class UserEventDto {
  @IsNumber()
  @IsNotEmpty()
  user_id: number;

  @IsNumber()
  @IsNotEmpty()
  product_id: number;

  @IsEnum(UserEventType)
  @IsNotEmpty()
  event_type: UserEventType;

  @IsOptional()
  @IsDateString()
  timestamp?: string;
}
