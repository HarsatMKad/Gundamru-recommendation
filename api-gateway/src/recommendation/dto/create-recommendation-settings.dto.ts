import {
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  ValidateIf,
  Min,
  Validate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { StrategyScope } from 'src/common/enum/StrategyScope.enum';
import { IsStrategyForScope } from '../scope-validator.util';

export class StrategyWeightDto {
  @IsString()
  @IsNotEmpty()
  @Validate(IsStrategyForScope, [StrategyScope.PERSONAL], { each: true })
  strategy!: string;

  @IsNumber()
  @Min(0.1)
  weight!: number;
}

export class CreateRecommendationSettingDto {
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StrategyWeightDto)
  personal_methods?: StrategyWeightDto[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ValidateIf((o: CreateRecommendationSettingDto) => !!o.fallback_weight)
  @IsString()
  @IsOptional()
  @Validate(IsStrategyForScope, [StrategyScope.GLOBAL])
  fallback_strategy?: string;

  @ValidateIf((o: CreateRecommendationSettingDto) => !!o.fallback_strategy)
  @IsNumber()
  @IsOptional()
  @Min(0.1)
  fallback_weight?: number;
}
