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
import { StrategyScope } from 'src/common/interface/strategies.interface';
import { IsStrategyForScope } from 'src/common/validators/is-strategy-for-scope.validator';

export class UpdateRecommenderSettingDto {
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
  @ValidateIf((o: UpdateRecommenderSettingDto) => !!o.fallback_weight)
  @Validate(IsStrategyForScope, [StrategyScope.GLOBAL])
  fallback_strategy?: string;

  @ValidateIf((o: UpdateRecommenderSettingDto) => !!o.fallback_strategy)
  @IsNumber()
  @IsOptional()
  fallback_weight?: number;
}
