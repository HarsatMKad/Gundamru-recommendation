import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Recommendation } from 'src/database/entities/recommendations.entity';
import {
  IRecommendationInput,
  IRecommendationItem,
} from 'src/common/interface/recommendation.interface';
import { RecommendationSetting } from 'src/database/entities/recommendation-settings.entity';
import { ERestMessages } from 'src/common/enum/Rest.enum';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { BadRequestException } from '@nestjs/common';
import {
  CACH_CONST,
  RECOMMENDATION_MODS,
} from 'src/common/const/ConstHandler.const';

@Injectable()
export class RecommendationService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @InjectRepository(Recommendation)
    private readonly recRepo: Repository<Recommendation>,
    @InjectRepository(RecommendationSetting)
    private readonly settingRepo: Repository<RecommendationSetting>,
  ) {}

  /** 1. Только пользовательские */
  async getPurePersonal(
    userId: string,
    context: string,
    minScore?: number,
  ): Promise<IRecommendationItem[]> {
    let minscoreCacheKey = '';
    if (minScore) {
      minscoreCacheKey = `_${minScore}`;
    }
    const cacheKey = `${CACH_CONST.CACHEKEY_PERSONAL}_${userId}_${context}${minscoreCacheKey}`;
    const cached = await this.cacheManager.get<IRecommendationItem[]>(cacheKey);
    if (cached) return cached;

    const setting = await this.settingRepo.findOne({
      where: { name: context },
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
  ): Promise<IRecommendationItem[]> {
    let minscoreCacheKey = '';
    if (minScore) {
      minscoreCacheKey = `_${minScore}`;
    }
    const cacheKey = `${CACH_CONST.CACHEKEY_FALLBACK}_${context}${minscoreCacheKey}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached as IRecommendationItem[];

    const setting = await this.settingRepo.findOne({
      where: { name: context },
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

  async getRecommendations(
    userId: string,
    context: string,
    mode: string,
    limit: number,
    minScore?: number,
  ) {
    let result: IRecommendationItem[] = [];

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
          `${ERestMessages.INVALID_MOD}: ${mode}. Available modes: ${Object.values(RECOMMENDATION_MODS).join(', ')}`,
        );
    }

    const sortedResults = result
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return {
      mode,
      context,
      limit,
      minScore,
      length: sortedResults.length,
      recommendations: sortedResults,
    };
  }

  async getAllRecommendations(limit: number, userId?: string) {
    if (userId) {
      const result = await this.recRepo.find({ where: { user_id: userId } });
      return {
        length: result.length,
        recommendations: result,
      };
    } else {
      const result = await this.recRepo.find({ take: limit });
      return {
        limit,
        length: result.length,
        recommendations: result,
      };
    }
  }

  async saveBatch(data: IRecommendationInput[]) {
    return await this.recRepo
      .createQueryBuilder()
      .insert()
      .into(Recommendation)
      .values(data)
      .orUpdate(['recommended_skus', 'generated_at'], ['user_id', 'setting_id'])
      .execute();
  }

  async deleteRecommendationsNotInSettingIds(
    settingIds: string[],
  ): Promise<number> {
    if (!settingIds || settingIds.length === 0) {
      const result = await this.recRepo
        .createQueryBuilder()
        .delete()
        .from(Recommendation)
        .execute();
      return result.affected || 0;
    }

    const result = await this.recRepo
      .createQueryBuilder()
      .delete()
      .from(Recommendation)
      .where('setting_id NOT IN (:...ids)', { ids: settingIds })
      .execute();
    return result.affected || 0;
  }
}
