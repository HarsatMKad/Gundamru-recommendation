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
import { IsStrategyForScope } from '../scope-validator.util';

export class UpdateRecommendationSettingDto {
  @IsString()
  name!: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => StrategyWeightDto)
  personalMethods?: StrategyWeightDto[];

  @IsBoolean()
  isActive!: boolean;

  @IsString()
  @IsOptional()
  @Validate(IsStrategyForScope, [StrategyScope.GLOBAL])
  fallbackStrategy?: string;

  @IsNumber()
  @IsOptional()
  @ValidateIf((o: UpdateRecommendationSettingDto) => !!o.fallbackStrategy)
  fallbackWeight?: number;
}
