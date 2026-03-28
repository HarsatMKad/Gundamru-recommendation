import {
  IsArray,
  ValidateNested,
  IsBoolean,
  IsOptional,
  IsNumber,
  IsString,
  ValidateIf,
  Validate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { StrategyWeightDto } from './create-recommendation-settings.dto';
import { StrategyScope } from 'src/common/enum/StrategyScope.enum';
import { IsStrategyForScope } from 'src/common/util/scope-validator.util';

export class UpdateRecommendationSettingDto {
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => StrategyWeightDto)
  personal_methods?: StrategyWeightDto[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  @ValidateIf((o: UpdateRecommendationSettingDto) => !!o.fallback_weight)
  @Validate(IsStrategyForScope, [StrategyScope.GLOBAL])
  fallback_strategy?: string;

  @ValidateIf((o: UpdateRecommendationSettingDto) => !!o.fallback_strategy)
  @IsNumber()
  @IsOptional()
  fallback_weight?: number;
}
