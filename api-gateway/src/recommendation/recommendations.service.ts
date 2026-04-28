import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Recommendation } from 'src/database/entities/recommendations.entity';
import { IRecommendationItem } from 'src/common/interface/recommendation.interface';
import { RecommendationSetting } from 'src/database/entities/recommendation-settings.entity';
import { ERestMessages } from 'src/common/enum/Rest.enum';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { BadRequestException } from '@nestjs/common';
import {
  RECOMMENDATION_MODS,
  RecommendationParamsDto,
  RecommendationQueryDto,
} from './dto/query-recommendation.dto';
import { ValidItemProvider } from 'src/generation-system/validItem.provider';
import { IRecommendationResponseSchema } from 'src/common/interface/recommendation.interface';

@Injectable()
export class RecommendationService {
  private readonly isRecommendedProductsCacheKey: string =
    'is_recommended_products';
  private readonly cacheKeyPersonal = 'rec-personal';
  private readonly cachKeyFallback = 'rec-fallback';

  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @InjectRepository(Recommendation)
    private readonly recRepo: Repository<Recommendation>,
    @InjectRepository(RecommendationSetting)
    private readonly settingRepo: Repository<RecommendationSetting>,
    private readonly validItemProvider: ValidItemProvider,
  ) {}

  /* 1. Только пользовательские */
  async getPurePersonal(
    userId: string,
    settingId: string,
    minScore: number,
  ): Promise<IRecommendationItem[]> {
    const cacheKey = `${this.cacheKeyPersonal}_${userId}_${settingId}_${minScore}`;
    const cached = await this.cacheManager.get<IRecommendationItem[]>(cacheKey);
    if (cached) return cached;

    const setting = await this.settingRepo.findOneBy({ id: settingId });
    if (!setting) return [];

    const personal = await this.recRepo.findOne({
      where: { user_id: userId, setting_id: setting.id },
    });
    if (!personal) return [];

    const data = personal?.recommended_skus || [];
    let dataFiltred = data;
    if (minScore && minScore > 0 && dataFiltred.length > 0) {
      dataFiltred = dataFiltred.filter((i) => i.score >= minScore);
    }
    await this.cacheManager.set(cacheKey, dataFiltred);
    return dataFiltred;
  }

  /* 2. Только стандартные */
  async getFallback(
    settingId: string,
    minScore?: number,
  ): Promise<IRecommendationItem[]> {
    let minscoreCacheKey = '';
    if (minScore) {
      minscoreCacheKey = `_${minScore}`;
    }
    const cacheKey = `${this.cachKeyFallback}_${settingId}${minscoreCacheKey}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached as IRecommendationItem[];

    const setting = await this.settingRepo.findOneBy({ id: settingId });

    const data = setting?.fallback_skus || [];
    let dataFiltred = data;
    if (minScore && minScore > 0 && dataFiltred.length > 0) {
      dataFiltred = dataFiltred.filter((i) => i.score >= minScore);
    }
    await this.cacheManager.set(cacheKey, dataFiltred);
    return dataFiltred;
  }

  //* Смешенные данные, если не хватает до нужного количества - дополняются из стандартных
  // если передан minScore -  пользовательские товары отсеивается, если их уверенность меньше */
  private mergeAndFill(
    personal: IRecommendationItem[],
    fallback: IRecommendationItem[],
  ): IRecommendationItem[] {
    const seen = new Set(personal.map((i) => i.sku));
    const result = [...personal];

    for (const item of fallback) {
      if (!seen.has(item.sku)) {
        result.push(item);
        seen.add(item.sku);
      }
    }

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

    // Хранить список товаров, которые is_recommended=true дольше обычного кэша (3 часа)
    await this.cacheManager.set(cacheKey, recommendedItems, 3600 * 1000 * 3);
    return this.insertRecommendedRandomly(products, recommendedItems);
  }

  async getRecommendations(
    param: RecommendationParamsDto,
    query: RecommendationQueryDto,
  ): Promise<IRecommendationResponseSchema> {
    const { settingId, userId, mode = RECOMMENDATION_MODS.MIXED } = param;
    const { addRecommendedProducts = false, minScore } = query;
    const limit = Number(query.limit) || 10;

    const cacheKey = `${userId}_${settingId}_${mode}_${limit}_${minScore}_${addRecommendedProducts}`;

    const cacheResponse =
      await this.cacheManager.get<IRecommendationResponseSchema>(cacheKey);

    if (cacheResponse) {
      return cacheResponse;
    }

    let result: IRecommendationItem[] = [];
    let personalLength: number = 0;
    let fallbackLength: number = 0;

    switch (mode) {
      // Только персональные
      case RECOMMENDATION_MODS.PERSONAL:
        result = await this.getPurePersonal(userId, settingId, minScore);
        personalLength = result.length;
        break;
      // Только стандартные
      case RECOMMENDATION_MODS.FALLBACK:
        result = await this.getFallback(settingId, minScore);
        fallbackLength = result.length;
        break;
      // Дополняет персональные стандартными
      case RECOMMENDATION_MODS.MIXED: {
        const [personal, fallback] = await Promise.all([
          this.getPurePersonal(userId, settingId, minScore),
          this.getFallback(settingId, minScore),
        ]);
        personalLength = personal.length;
        fallbackLength = fallback.length;
        result = this.mergeAndFill(personal, fallback);
        break;
      }
      // Тоже самое, что MIXED, но отбор минимальной оценке не действует на стандартные товары
      case RECOMMENDATION_MODS.MIXED_FULLFALLBACK: {
        const [personal, fallback] = await Promise.all([
          this.getPurePersonal(userId, settingId, minScore),
          this.getFallback(settingId),
        ]);
        personalLength = personal.length;
        fallbackLength = fallback.length;
        result = this.mergeAndFill(personal, fallback);
        break;
      }
      default:
        throw new BadRequestException(
          `${ERestMessages.INVALID_MOD}: ${mode}. Available modes: ${Object.values(RECOMMENDATION_MODS).join(', ')}`,
        );
    }

    result = result.sort((a, b) => b.score - a.score).slice(0, limit);

    if (addRecommendedProducts) {
      result = await this.addRecommendedProducts(result);
    }

    const response: IRecommendationResponseSchema = {
      mode,
      userId,
      settingId,
      limit,
      minScore,
      isAddRecommendedProducts: addRecommendedProducts,
      recommendations: result,
      length: result.length,
      personalLength,
      fallbackLength,
    };

    await this.cacheManager.set(cacheKey, response);
    return response;
  }
}
