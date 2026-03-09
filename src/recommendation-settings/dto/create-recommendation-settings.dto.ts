import {
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class StrategyWeightDto {
  @IsString()
  @IsNotEmpty()
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
  methods: StrategyWeightDto[];

  @IsBoolean()
  @IsOptional()
  isActive: boolean;
}
