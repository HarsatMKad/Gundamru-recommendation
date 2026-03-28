import {
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  ValidateIf,
  Validate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { StrategyScope } from 'src/common/interface/strategies.interface';
import { IsStrategyForScope } from 'src/common/validators/is-strategy-for-scope.validator';

export class StrategyWeightDto {
  @IsString()
  @IsNotEmpty()
  @Validate(IsStrategyForScope, [StrategyScope.PERSONAL], { each: true })
  strategy: string;

  @IsNumber()
  weight: number;
}

export class CreateRecommenderSettingDto {
  @IsString()
  @IsNotEmpty()
  target_context: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StrategyWeightDto)
  personal_methods: StrategyWeightDto[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ValidateIf((o: CreateRecommenderSettingDto) => !!o.fallback_weight)
  @IsString()
  @IsOptional()
  @Validate(IsStrategyForScope, [StrategyScope.GLOBAL])
  fallback_strategy?: string;

  @ValidateIf((o: CreateRecommenderSettingDto) => !!o.fallback_strategy)
  @IsNumber()
  @IsOptional()
  fallback_weight?: number;
}
