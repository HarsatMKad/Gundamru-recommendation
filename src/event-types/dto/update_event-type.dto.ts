import { IsNumber, IsBoolean, IsOptional } from 'class-validator';

export class UpdateEventTypeDto {
  @IsNumber()
  @IsOptional()
  weight?: number;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
