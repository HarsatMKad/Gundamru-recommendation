import {
  IsInt,
  Min,
  IsNumber,
  IsBoolean,
  IsUUID,
  IsString,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

export const RECOMMENDATION_MODS = {
  PERSONAL: 'personal',
  FALLBACK: 'fallback',
  MIXED: 'mixed',
  MIXED_FULLFALLBACK: 'mixed-fullfallback',
};

export class RecommendationQueryDto {
  @IsBoolean()
  @Type(() => Boolean)
  addRecommendedProducts: boolean = false;

  @IsInt()
  @Min(0)
  @Type(() => Number)
  limit: number = 10;

  @IsNumber()
  @Type(() => Number)
  minScore: number = 0;
}

export class RecommendationParamsDto {
  @IsUUID()
  @IsNotEmpty()
  userId!: string;
}

export class RecSettingFindByIdDto {
  @IsUUID()
  id!: string;
}

export class RecSettingFindByNameDto {
  @IsString()
  type!: string;
}
