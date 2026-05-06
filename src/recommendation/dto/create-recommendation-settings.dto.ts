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
  @Min(0)
  weight!: number;
}

export class CreateRecommendationSettingDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  type!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StrategyWeightDto)
  personalMethods?: StrategyWeightDto[];

  @ValidateIf((o: CreateRecommendationSettingDto) => !!o.fallbackWeight)
  @IsString()
  @IsOptional()
  @Validate(IsStrategyForScope, [StrategyScope.GLOBAL])
  fallbackStrategy?: string;

  @ValidateIf((o: CreateRecommendationSettingDto) => !!o.fallbackStrategy)
  @IsNumber()
  @IsOptional()
  @Min(0)
  fallbackWeight?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
