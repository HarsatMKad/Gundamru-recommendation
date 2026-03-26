import { Injectable } from '@nestjs/common';
import { Recommendation } from 'src/recommendation/entities/recommendations.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RecommendationInput } from '../common/interface/recommendation.interface';

@Injectable()
export class BatchWriter {
  constructor(
    @InjectRepository(Recommendation)
    private recRepo: Repository<Recommendation>,
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

  async deleteRecommendationsBySettingIds(settingIds: string[]) {
    await this.recRepo
      .createQueryBuilder()
      .delete()
      .from(Recommendation)
      .where('setting_id IN (:...ids)', { ids: settingIds })
      .execute();
  }
}
