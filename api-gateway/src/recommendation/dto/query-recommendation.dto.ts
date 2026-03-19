import { IsInt, Min, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { RECOMMENDATION_CONST } from 'src/common/util/const-handler.util';

export class RecQueryDto {
  @IsInt()
  @Min(0)
  @Type(() => Number)
  limit?: number = RECOMMENDATION_CONST.RECOMMENDATION_LENGTH;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  minScore?: number;
}
