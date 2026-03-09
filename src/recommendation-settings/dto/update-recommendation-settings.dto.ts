import {
  IsArray,
  ValidateNested,
  IsBoolean,
  IsOptional,
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
}
