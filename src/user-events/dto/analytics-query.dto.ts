import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum SortField {
  CURRENT_COUNT = 'current_count',
  PREVIOUS_COUNT = 'previous_count',
  TREND = 'trend',
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class StatisticsRequestDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 20;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  offset?: number = 0;

  @IsOptional()
  @IsEnum(SortField)
  sortBy?: SortField = SortField.CURRENT_COUNT;

  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;

  @IsOptional()
  @IsString()
  brandSlug?: string;

  @IsOptional()
  @IsString()
  productName?: string;
}

export class ProductTrendDto {
  productId?: string;
  name?: string;
  brand?: string;
  attributes?: {
    grade?: string;
    scale?: string;
  };
  isRecomended?: boolean;
  currentPeriodCount?: number;
  previousPeriodCount?: number;
  trend?: number;
  trendPercentage?: number;
}

export interface ProductStatsRaw {
  productId: string;
  totalCount: number;
  productName: string;
  isRecomended: boolean;
  brandName: string;
  grade: string;
  scale: string;
}

export class StatisticsResponseDto {
  period?: {
    current: {
      start: Date;
      end: Date;
    };
    previous: {
      start: Date;
      end: Date;
    };
  };
  summary?: {
    currentEvents: number;
    previousEvents: number;
    totalTrend: number;
    totalTrendPercentage: number;
  };
  items?: ProductTrendDto[];
  total?: number;
}
