import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Recommendation } from 'src/database/entities/recommendations.entity';
import { IRecommendationItem } from 'src/common/interface/recommendation.interface';
import { RecommendationSetting } from 'src/database/entities/recommendation-settings.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import {
  RecommendationParamsDto,
  RecommendationQueryDto,
} from './dto/query-recommendation.dto';
import { ValidItemProvider } from 'src/generation-system/validItem.provider';

@Injectable()
export class RecommendationService {
  private readonly isRecommendedProductsCacheKey: string =
    'is_recommended_products';
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @InjectRepository(Recommendation)
    private readonly recRepo: Repository<Recommendation>,
    @InjectRepository(RecommendationSetting)
    private readonly settingRepo: Repository<RecommendationSetting>,
    private readonly validItemProvider: ValidItemProvider,
  ) {}

  async getRecommendations(
    param: RecommendationParamsDto,
    query: RecommendationQueryDto,
  ): Promise<Record<string, IRecommendationItem[]>> {
    const userId = param.userId;
    const { addRecommendedProducts = false, minScore } = query;
    const limit = Number(query.limit) || 20;

    const cacheKey = `${userId}_${limit}_${minScore}_${addRecommendedProducts}`;

    const cacheResponse =
      await this.cacheManager.get<Record<string, IRecommendationItem[]>>(
        cacheKey,
      );

    if (cacheResponse) {
      return cacheResponse;
    }

    const settings = await this.settingRepo.find();
    const recommendations = await this.recRepo.find({
      where: { userId },
    });

    const personal: Record<string, IRecommendationItem[]> = {};
    const result: Record<string, IRecommendationItem[]> = {};

    recommendations.forEach((r) => {
      personal[r.settingId] = r.recommendedSkus;
    });

    for (const s of settings) {
      if (s.fallbackSkus) {
        let resultProducts = this.mergeAndFill(
          limit,
          s.fallbackSkus,
          personal[s.id],
        );

        if (minScore && minScore > 0 && resultProducts.length > 0) {
          resultProducts = resultProducts.filter((i) => i.score >= minScore);
        }

        if (addRecommendedProducts) {
          resultProducts = await this.addRecommendedProducts(resultProducts);
        }

        result[s.type] = resultProducts;
      } else {
        result[s.type] = [];
      }
    }

    await this.cacheManager.set(cacheKey, result);
    return result;
  }

  // Смешенные данные, если не хватает до нужного количества
  private mergeAndFill(
    limit: number,
    fallback: IRecommendationItem[],
    personal?: IRecommendationItem[],
  ): IRecommendationItem[] {
    const personalSkus = new Set<string>();

    if (!personal) {
      return fallback;
    }
    personal.forEach((p) => {
      personalSkus.add(p.sku);
    });

    const result = [...personal];

    for (const item of fallback) {
      if (result.length < limit && !personalSkus.has(item.sku)) {
        result.push(item);
        personalSkus.add(item.sku);
      }
    }

    result.sort((a, b) => b.score - a.score).slice(0, limit);
    return result;
  }

  private insertRecommendedRandomly(
    originalProducts: IRecommendationItem[],
    recommendedProducts: IRecommendationItem[],
  ): IRecommendationItem[] {
    if (recommendedProducts.length === 0) {
      return [...originalProducts];
    }

    const result = [...originalProducts];
    for (const recommendedProduct of recommendedProducts) {
      const randomIndex = Math.floor(Math.random() * (result.length + 1));
      result.splice(randomIndex, 0, recommendedProduct);
    }
    return result;
  }

  // Получить товары, которые имеют is_recommended=true
  private async addRecommendedProducts(
    products: IRecommendationItem[],
  ): Promise<IRecommendationItem[]> {
    const cacheKey = this.isRecommendedProductsCacheKey;

    const cached = await this.cacheManager.get<IRecommendationItem[]>(cacheKey);
    if (cached) return this.insertRecommendedRandomly(products, cached);

    const allProducts =
      await this.validItemProvider.getValidProductsWithAttributes();

    const recommendedProducts = allProducts.filter(
      (p) => p.isRecomended === true,
    );

    if (recommendedProducts.length === 0) {
      return products;
    }

    const recommendedItems: IRecommendationItem[] = recommendedProducts.map(
      (product) => ({
        sku: product.id,
        score: 10,
      }),
    );

    // Хранить дольше обычного кэша (3 часа) т.к. редко меняются
    await this.cacheManager.set(cacheKey, recommendedItems, 3600 * 1000 * 3);
    return this.insertRecommendedRandomly(products, recommendedItems);
  }
}
