import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  Min,
} from 'class-validator';

export class CreateEventTypeDto {
  @IsString()
  name!: string;

  @IsNumber()
  weight!: number;

  @IsNumber()
  @Min(1)
  max_for_user?: number = 50;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean = true;
}
