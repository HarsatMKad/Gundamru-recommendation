import { BadRequestException, Injectable } from 'node_modules/@nestjs/common';
import { InjectRepository } from 'node_modules/@nestjs/typeorm';
import { Repository } from 'node_modules/typeorm';
import { UserEventNames } from 'src/common/enum/UserEventName.enum';
import { UserEvent } from 'src/database/entities/user-event.entity';
import {
  ProductTrendDto,
  SortField,
  SortOrder,
  StatisticsRequestDto,
  StatisticsResponseDto,
  TrendDirection,
} from './dto/analytics-query.dto';
import { EErrorHandler } from 'src/common/enum/ErrHandler.enum';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(UserEvent)
    private readonly userEventRepository: Repository<UserEvent>,
  ) {}

  async getStatisticsWithTrend(
    eventType: UserEventNames,
    request: StatisticsRequestDto,
  ): Promise<StatisticsResponseDto> {
    const { currentStart, currentEnd } = this.getDefaultDates(
      request.startDate,
      request.endDate,
    );

    if (currentStart > currentEnd) {
      throw new BadRequestException(EErrorHandler.START_AND_END_DATE_ORDER);
    }

    const periodDuration = currentEnd.getTime() - currentStart.getTime();
    const previousEnd = new Date(currentStart.getTime() - 1);
    const previousStart = new Date(previousEnd.getTime() - periodDuration);

    const [currentStats, previousStats] = await Promise.all([
      this.getProductStats(currentStart, currentEnd, eventType),
      this.getProductStats(previousStart, previousEnd, eventType),
    ]);

    let productsWithTrend = this.calculateTrends(currentStats, previousStats);

    const sortBy: SortField = request.sortBy ?? SortField.CURRENT_COUNT;
    const sortOrder: SortOrder = request.sortOrder ?? SortOrder.ASC;
    productsWithTrend = this.applySorting(productsWithTrend, sortBy, sortOrder);

    const totalCurrent = productsWithTrend.reduce(
      (sum, p) => sum + (p.current_period_count ?? 0),
      0,
    );
    const totalPrevious = productsWithTrend.reduce(
      (sum, p) => sum + (p.previous_period_count ?? 0),
      0,
    );
    const totalTrend = totalCurrent - totalPrevious;
    const totalTrendPercentage =
      totalPrevious === 0
        ? totalCurrent > 0
          ? 100
          : 0
        : (totalTrend / totalPrevious) * 100;

    const totalItems = productsWithTrend.length;
    const limit = Number(request.limit) || 20;
    const offset = Number(request.offset) || 0;
    const paginatedProducts = this.applyPagination(
      productsWithTrend,
      offset,
      limit,
    );

    return {
      period: {
        current: { start: currentStart, end: currentEnd },
        previous: { start: previousStart, end: previousEnd },
      },
      summary: {
        total_products_with_events: productsWithTrend.length,
        total_current_events: totalCurrent,
        total_previous_events: totalPrevious,
        total_trend: totalTrend,
        total_trend_percentage: Math.round(totalTrendPercentage * 100) / 100,
      },
      items: paginatedProducts,
      total: totalItems,
    };
  }

  private applyPagination<T>(items: T[], offset: number, limit: number): T[] {
    return items.slice(offset, offset + limit);
  }

  private async getProductStats(
    startDate: Date,
    endDate: Date,
    eventType: UserEventNames,
  ): Promise<Map<string, number>> {
    const result = await this.userEventRepository
      .createQueryBuilder('event')
      .select('event.product_id', 'product_id')
      .addSelect('SUM(event.count)', 'total_count')
      .where('event.timestamp BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .andWhere('event.event_type_name = :eventType', { eventType })
      .groupBy('event.product_id')
      .getRawMany();

    const statsMap = new Map<string, number>();
    result.forEach((item) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      statsMap.set(item.product_id, parseInt(item.total_count));
    });

    return statsMap;
  }

  private calculateTrends(
    currentStats: Map<string, number>,
    previousStats: Map<string, number>,
  ): ProductTrendDto[] {
    const allProductIds = new Set([
      ...currentStats.keys(),
      ...previousStats.keys(),
    ]);

    const productsWithTrend: ProductTrendDto[] = [];

    for (const productId of allProductIds) {
      const currentCount = currentStats.get(productId) || 0;
      const previousCount = previousStats.get(productId) || 0;
      const trend = currentCount - previousCount;
      const trendPercentage =
        previousCount === 0
          ? currentCount > 0
            ? 100
            : 0
          : (trend / previousCount) * 100;

      let trendDirection: TrendDirection = TrendDirection.STABLE;
      if (trend > 0) trendDirection = TrendDirection.UP;
      if (trend < 0) trendDirection = TrendDirection.DOWN;

      productsWithTrend.push({
        product_id: productId,
        current_period_count: currentCount,
        previous_period_count: previousCount,
        trend: trend,
        trend_percentage: Math.round(trendPercentage * 100) / 100,
        trend_direction: trendDirection,
      });
    }

    return productsWithTrend;
  }

  private applySorting(
    products: ProductTrendDto[],
    sortBy: SortField = SortField.CURRENT_COUNT,
    sortOrder: SortOrder = SortOrder.ASC,
  ): ProductTrendDto[] {
    const sorted = [...products];

    switch (sortBy) {
      case SortField.CURRENT_COUNT:
        sorted.sort((a, b) => {
          const result =
            (b.current_period_count ?? 0) - (a.current_period_count ?? 0);
          return sortOrder === SortOrder.ASC ? result : -result;
        });
        break;

      case SortField.PREVIOUS_COUNT:
        sorted.sort((a, b) => {
          const result =
            (a.previous_period_count ?? 0) - (b.previous_period_count ?? 0);
          return sortOrder === SortOrder.ASC ? result : -result;
        });
        break;

      case SortField.TREND:
        sorted.sort((a, b) => {
          const result = (a.trend ?? 0) - (b.trend ?? 0);
          return sortOrder === SortOrder.ASC ? result : -result;
        });
        break;

      default:
        sorted.sort(
          (a, b) =>
            (b.current_period_count ?? 0) - (a.current_period_count ?? 0),
        );
    }

    return sorted;
  }

  private getDefaultDates(
    startDateStr?: string,
    endDateStr?: string,
  ): { currentStart: Date; currentEnd: Date } {
    let currentEnd: Date;
    let currentStart: Date;

    if (endDateStr) {
      currentEnd = new Date(endDateStr);
      currentEnd.setHours(23, 59, 59, 999);
    } else {
      currentEnd = new Date();
      currentEnd.setHours(23, 59, 59, 999);
    }

    if (startDateStr) {
      currentStart = new Date(startDateStr);
      currentStart.setHours(0, 0, 0, 0);
    } else {
      currentStart = new Date(currentEnd);
      currentStart.setDate(currentEnd.getDate() - 7);
      currentStart.setHours(0, 0, 0, 0);
    }

    return { currentStart, currentEnd };
  }
}
