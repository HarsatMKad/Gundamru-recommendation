import { Injectable } from '@nestjs/common';
import { Recommendation } from 'src/recommendations/entities/recommendations.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RecommendationItem } from 'src/recommendations/entities/recommendations.entity';

export interface RecommendationInput {
  user_id: number;
  recommended_skus: RecommendationItem[];
  setting_id: number;
  generated_at?: Date;
}

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
