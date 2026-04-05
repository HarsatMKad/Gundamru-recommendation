import { IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator';

export class CreateEventTypeDto {
  @IsString()
  name!: string;

  @IsNumber()
  weight!: number;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean = true;
}
