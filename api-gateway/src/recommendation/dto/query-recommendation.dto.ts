import { IsInt, Min, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { RECOMMENDATION_LENTGH } from 'src/common/util/const-handler.util';

export class RecQueryDto {
  @IsInt()
  @Min(0)
  @Type(() => Number)
  limit?: number = RECOMMENDATION_LENTGH;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  minScore?: number;
}
