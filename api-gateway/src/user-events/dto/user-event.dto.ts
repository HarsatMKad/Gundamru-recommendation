import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsDateString,
  IsString,
} from 'class-validator';

export class UserEventDto {
  @IsNumber()
  @IsNotEmpty()
  user_id: number;

  @IsNumber()
  @IsNotEmpty()
  product_id: number;

  @IsString()
  @IsNotEmpty()
  event_type_name: string;

  @IsOptional()
  @IsDateString()
  timestamp?: string;
}
