import {
  IsNotEmpty,
  IsNumber,
  IsIn,
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

  @IsIn([UserEventType.VIEW, UserEventType.ADD_TO_CART, UserEventType.PURCHASE])
  @IsNotEmpty()
  event_type: UserEventType;

  @IsOptional()
  @IsDateString()
  timestamp?: string;
}
