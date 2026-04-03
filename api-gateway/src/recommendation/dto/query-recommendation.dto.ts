import { IsInt, Min, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class RecQueryDto {
  @IsInt()
  @Min(0)
  @Type(() => Number)
  limit: number = 100;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  minScore?: number;
}
