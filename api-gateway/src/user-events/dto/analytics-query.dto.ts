import { IsDateString, IsEnum, IsInt, IsOptional, Min } from 'class-validator';
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

export enum TrendDirection {
  UP = 'up',
  DOWN = 'down',
  STABLE = 'stable',
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
}

export class ProductTrendDto {
  product_id?: string;
  current_period_count?: number;
  previous_period_count?: number;
  trend?: number;
  trend_percentage?: number;
  trend_direction?: TrendDirection;
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
    total_products_with_events: number;
    total_current_events: number;
    total_previous_events: number;
    total_trend: number;
    total_trend_percentage: number;
  };
  items?: ProductTrendDto[];
  total?: number;
}
