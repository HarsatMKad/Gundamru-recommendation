import {
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsString,
} from 'class-validator';

export class UserEventDto {
  @IsString()
  @IsNotEmpty()
  user_id: string;

  @IsString()
  @IsNotEmpty()
  product_id: string;

  @IsString()
  @IsNotEmpty()
  event_type_id: string;

  @IsOptional()
  @IsDateString()
  timestamp?: string;
}
