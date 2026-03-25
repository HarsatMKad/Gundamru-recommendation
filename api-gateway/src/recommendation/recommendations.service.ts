import { Injectable, Inject, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Recommendation } from './entities/recommendations.entity';
import { RecommendationItem } from 'src/common/interface/recommendation.interface';
import { RecommenderSetting } from 'src/recommendation-settings/entities/settings.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { BadRequestException } from '@nestjs/common';
import {
  CACH_CONST,
  RECOMMENDATION_CONST,
  RECOMMENDATION_MODS,
} from 'src/common/util/const-handler.util';
import {
  REST_MESSAGES,
  REST_STATUS,
} from 'src/common/util/rest-message-handler.util';

@Injectable()
export class RecommendationService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @InjectRepository(Recommendation)
    private readonly recRepo: Repository<Recommendation>,
    @InjectRepository(RecommenderSetting)
    private readonly settingRepo: Repository<RecommenderSetting>,
  ) {}

  /** 1. Только пользовательские */
  async getPurePersonal(
    userId: number,
    context: string,
    minScore?: number,
  ): Promise<RecommendationItem[]> {
    let minscoreCacheKey = '';
    if (minScore) {
      minscoreCacheKey = `_${minScore}`;
    }
    const cacheKey = `${CACH_CONST.CACHEKEY_PERSONAL}_${userId}_${context}${minscoreCacheKey}`;
    const cached = await this.cacheManager.get<RecommendationItem[]>(cacheKey);
    if (cached) return cached;

    const setting = await this.settingRepo.findOne({
      where: { target_context: context },
    });
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

  /** 2. Только стандартные */
  async getFallback(
    context: string,
    minScore?: number,
  ): Promise<RecommendationItem[]> {
    let minscoreCacheKey = '';
    if (minScore) {
      minscoreCacheKey = `_${minScore}`;
    }
    const cacheKey = `${CACH_CONST.CACHEKEY_FALLBACK}_${context}${minscoreCacheKey}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached as RecommendationItem[];

    const setting = await this.settingRepo.findOne({
      where: { target_context: context },
    });

    const data = setting?.fallback_skus || [];
    let dataFiltred = data;
    if (minScore && minScore > 0 && dataFiltred.length > 0) {
      dataFiltred = dataFiltred.filter((i) => i.score >= minScore);
    }
    await this.cacheManager.set(cacheKey, dataFiltred);
    return dataFiltred;
  }

  //** Смешенные данные, если не хватает до нужного количества - дополняются из стандартных
  // если передан minScore -  пользовательские товары отсеивается, если их уверенность меньше */
  private mergeAndFill(
    personal: RecommendationItem[],
    fallback: RecommendationItem[],
  ): RecommendationItem[] {
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

  async getRecommendations(
    userId: number,
    context: string,
    mode: string,
    limit: number = RECOMMENDATION_CONST.RECOMMENDATION_LENGTH,
    minScore?: number,
  ) {
    let result: RecommendationItem[] = [];

    switch (mode) {
      case RECOMMENDATION_MODS.PERSONAL:
        result = await this.getPurePersonal(userId, context, minScore);
        break;
      case RECOMMENDATION_MODS.FALLBACK:
        result = await this.getFallback(context, minScore);
        break;
      case RECOMMENDATION_MODS.MIXED: {
        const [personal, fallback] = await Promise.all([
          this.getPurePersonal(userId, context, minScore),
          this.getFallback(context, minScore),
        ]);
        result = this.mergeAndFill(personal, fallback);
        break;
      }
      case RECOMMENDATION_MODS.MIXED_FULLFALLBACK: {
        const [personal, fallback] = await Promise.all([
          this.getPurePersonal(userId, context, minScore),
          this.getFallback(context),
        ]);
        result = this.mergeAndFill(personal, fallback);
        break;
      }
      default:
        throw new BadRequestException(
          `${REST_MESSAGES.INVALID_MOD}: ${mode}. Available modes: ${Object.values(RECOMMENDATION_MODS).join(', ')}`,
        );
    }

    const sortedResults = result
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return {
      code: HttpStatus.OK,
      data: {
        recommendations: sortedResults,
        length: sortedResults.length,
        mode,
        context,
        limit,
        minScore,
      },
      message: REST_STATUS.SUCCESS,
    };
  }
}
