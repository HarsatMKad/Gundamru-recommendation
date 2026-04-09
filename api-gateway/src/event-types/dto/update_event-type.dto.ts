import {
  IsNumber,
  IsBoolean,
  IsOptional,
  Min,
  IsString,
} from 'class-validator';

export class UpdateEventTypeDto {
  @IsString()
  name?: string;

  @IsNumber()
  @IsOptional()
  weight?: number;

  @Min(1)
  @IsNumber()
  @IsOptional()
  max_for_user?: number = 50;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
