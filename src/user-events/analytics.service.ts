import { BadRequestException, Injectable } from 'node_modules/@nestjs/common';
import { InjectRepository } from 'node_modules/@nestjs/typeorm';
import { Repository } from 'node_modules/typeorm';
import { UserEventNames } from 'src/common/enum/UserEventName.enum';
import { UserEvent } from 'src/database/entities/user-event.entity';
import {
  ProductStatsRaw,
  ProductTrendDto,
  SortField,
  SortOrder,
  StatisticsRequestDto,
  StatisticsResponseDto,
} from './dto/analytics-query.dto';
import { EErrorHandler } from 'src/common/enum/ErrHandler.enum';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(UserEvent)
    private readonly userEventRepository: Repository<UserEvent>,
  ) {}

  private async getProductStats(
    startDate: Date,
    endDate: Date,
    filters: { eventType: string; productName?: string; brandSlug?: string },
  ): Promise<ProductStatsRaw[]> {
    const { eventType, productName, brandSlug } = filters;
    const queryBuilder = this.userEventRepository
      .createQueryBuilder('event')
      .select('event.product_id', 'productId')
      .addSelect('SUM(event.count)', 'totalCount')
      .addSelect('product.name', 'productName')
      .addSelect('product.is_recomended', 'isRecomended')
      .addSelect('brand.name', 'brandName')
      .addSelect('attributes.grade', 'grade')
      .addSelect('attributes.scale', 'scale')
      .innerJoin('product', 'product', 'product.id = event.product_id')
      .leftJoin('product_brand', 'brand', 'brand.id = product.brand_id')
      .leftJoin(
        'product_attributes',
        'attributes',
        'attributes.product_id = product.id',
      )
      .where('event.timestamp BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .andWhere('event.event_type_name = :eventType', { eventType });

    if (brandSlug) {
      queryBuilder.andWhere('brand.slug = :brandSlug', { brandSlug });
    }

    if (productName) {
      queryBuilder.andWhere('product.name ILIKE :productName', {
        productName: `%${productName}%`,
      });
    }

    queryBuilder
      .groupBy('event.product_id')
      .addGroupBy('product.name')
      .addGroupBy('product.slug')
      .addGroupBy('product.is_recomended')
      .addGroupBy('brand.name')
      .addGroupBy('attributes.grade')
      .addGroupBy('attributes.scale');

    const result = await queryBuilder.getRawMany<ProductStatsRaw>();

    return result.map((item) => ({
      ...item,
      totalCount: Number(item.totalCount),
    }));
  }

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

    const filters = {
      eventType,
      brandSlug: request.brandSlug,
      productName: request.productName,
    };
    const [currentStats, previousStats] = await Promise.all([
      this.getProductStats(currentStart, currentEnd, filters),
      this.getProductStats(previousStart, previousEnd, filters),
    ]);

    let productsWithTrend = this.calculateTrends(currentStats, previousStats);

    const sortBy: SortField = request.sortBy ?? SortField.CURRENT_COUNT;
    const sortOrder: SortOrder = request.sortOrder ?? SortOrder.ASC;
    productsWithTrend = this.applySorting(productsWithTrend, sortBy, sortOrder);

    const totalCurrent = productsWithTrend.reduce(
      (sum, p) => sum + (p.currentPeriodCount ?? 0),
      0,
    );
    const totalPrevious = productsWithTrend.reduce(
      (sum, p) => sum + (p.previousPeriodCount ?? 0),
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
    const limit = Number(request.limit) || 50;
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
        currentEvents: totalCurrent,
        previousEvents: totalPrevious,
        totalTrend: totalTrend,
        totalTrendPercentage: Math.round(totalTrendPercentage * 100) / 100,
      },
      items: paginatedProducts,
      total: totalItems,
    };
  }

  private applyPagination<T>(items: T[], offset: number, limit: number): T[] {
    return items.slice(offset, offset + limit);
  }

  private calculateTrends(
    currentStats: ProductStatsRaw[],
    previousStats: ProductStatsRaw[],
  ): ProductTrendDto[] {
    const allProducts: Record<
      string,
      {
        name: string;
        brandName: string;
        grade: string;
        scale: string;
        isRecomended: boolean;
      }
    > = {};
    const currentStatMap: Record<string, number> = {};
    const previousStatMap: Record<string, number> = {};
    currentStats.forEach((s) => {
      currentStatMap[s.productId] = s.totalCount;

      allProducts[s.productId] = {
        brandName: s.brandName,
        scale: s.scale,
        name: s.productName,
        grade: s.grade,
        isRecomended: s.isRecomended,
      };
    });

    previousStats.forEach((s) => {
      previousStatMap[s.productId] = s.totalCount;

      allProducts[s.productId] = {
        brandName: s.brandName,
        scale: s.scale,
        name: s.productName,
        grade: s.grade,
        isRecomended: s.isRecomended,
      };
    });

    const productsWithTrend: ProductTrendDto[] = [];
    for (const productId in allProducts) {
      const currentCount = currentStatMap[productId] || 0;
      const previousCount = previousStatMap[productId] || 0;
      const trend = currentCount - previousCount;
      const trendPercentage =
        previousCount === 0
          ? currentCount > 0
            ? 100
            : 0
          : (trend / previousCount) * 100;

      const product = allProducts[productId];
      productsWithTrend.push({
        productId: productId,
        name: product.name,
        brand: product.brandName,
        attributes: {
          grade: product.grade,
          scale: product.scale,
        },
        isRecomended: product.isRecomended,
        currentPeriodCount: currentCount,
        previousPeriodCount: previousCount,
        trend: trend,
        trendPercentage: Math.round(trendPercentage * 100) / 100,
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
            (b.currentPeriodCount ?? 0) - (a.currentPeriodCount ?? 0);
          return sortOrder === SortOrder.ASC ? result : -result;
        });
        break;

      case SortField.PREVIOUS_COUNT:
        sorted.sort((a, b) => {
          const result =
            (a.previousPeriodCount ?? 0) - (b.previousPeriodCount ?? 0);
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
          (a, b) => (b.currentPeriodCount ?? 0) - (a.currentPeriodCount ?? 0),
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
      currentEnd.setUTCHours(23, 59, 59, 999);
    } else {
      currentEnd = new Date();
      currentEnd.setUTCHours(23, 59, 59, 999);
    }

    if (startDateStr) {
      currentStart = new Date(startDateStr);
      currentStart.setUTCHours(0, 0, 0, 0);
    } else {
      currentStart = new Date(currentEnd);
      currentStart.setUTCDate(currentEnd.getUTCDate() - 7);
      currentStart.setUTCHours(0, 0, 0, 0);
    }

    return { currentStart, currentEnd };
  }
}
