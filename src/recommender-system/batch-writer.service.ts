import { Injectable } from '@nestjs/common';
import { Recommendation } from 'src/recommendations/entities/recommendations.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RecommendationInput } from './interface/recommendation.interface';

@Injectable()
export class BatchWriter {
  constructor(
    @InjectRepository(Recommendation)
    private repo: Repository<Recommendation>,
  ) {}

  async saveBatch(data: RecommendationInput[]) {
    return await this.repo
      .createQueryBuilder()
      .insert()
      .into(Recommendation)
      .values(data)
      .orUpdate(['recommended_skus', 'generated_at'], ['user_id', 'setting_id'])
      .execute();
  }

  async deleteRecommendationsBySettingIds(settingIds: number[]): Promise<void> {
    await this.repo
      .createQueryBuilder()
      .delete()
      .from(Recommendation)
      .where('setting_id IN (:...ids)', { ids: settingIds })
      .execute();
  }
}
