import { Injectable } from '@nestjs/common';
import { Recommendation } from 'src/recommendations/entities/recommendations.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RecommendationInput } from './interface/recommendation.interface';
import { FallbackRecommendation } from 'src/fallback-recommendation/entities/fallback-recommendation.entity';
import { RecommendationItem as RecItem } from 'src/fallback-recommendation/entities/fallback-recommendation.entity';

@Injectable()
export class BatchWriter {
  constructor(
    @InjectRepository(Recommendation)
    private recRepo: Repository<Recommendation>,
    @InjectRepository(FallbackRecommendation)
    private fallbackRepo: Repository<FallbackRecommendation>,
  ) {}

  async saveBatch(data: RecommendationInput[]) {
    return await this.recRepo
      .createQueryBuilder()
      .insert()
      .into(Recommendation)
      .values(data)
      .orUpdate(['recommended_skus', 'generated_at'], ['user_id', 'setting_id'])
      .execute();
  }

  async deleteRecommendationsBySettingIds(settingIds: number[]) {
    await this.recRepo
      .createQueryBuilder()
      .delete()
      .from(Recommendation)
      .where('setting_id IN (:...ids)', { ids: settingIds })
      .execute();
  }

  async saveBatchFallback(
    data: { name: string; recommended_skus: RecItem[] }[],
  ) {
    return await this.fallbackRepo
      .createQueryBuilder()
      .insert()
      .into(FallbackRecommendation)
      .values(data)
      .orUpdate(['recommended_skus', 'generated_at'], ['name'])
      .execute();
  }
}
