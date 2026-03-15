import {
  IsArray,
  ValidateNested,
  IsBoolean,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { StrategyWeightDto } from './create-recommendation-settings.dto';

export class UpdateRecommenderSettingDto {
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => StrategyWeightDto)
  methods?: StrategyWeightDto[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  fallback_rec_id?: number;

  @IsBoolean()
  @IsOptional()
  is_default?: boolean;
}
