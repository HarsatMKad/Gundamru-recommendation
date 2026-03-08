import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  TargetContextType,
  Recommendation,
} from './entities/recommendations.entity';

@Injectable()
export class RecommendationsService {
  constructor(
    @InjectRepository(Recommendation)
    private readonly recommendationsRepository: Repository<Recommendation>,
  ) {}

  async getForUser(userId: number): Promise<Recommendation> {
    const recs = await this.recommendationsRepository.findOne({
      where: { user_id: userId },
    });

    if (!recs) {
      throw new NotFoundException(
        `Recommendations for user ${userId} not found.`,
      );
    }
    return recs;
  }

  async saveOrUpdate(
    userId: number,
    targetContext: TargetContextType,
    skus: { sku: number; score: number }[],
  ): Promise<Recommendation> {
    const recommendation = new Recommendation();
    recommendation.user_id = userId;
    recommendation.target_context = targetContext;
    recommendation.recommendde_skus = skus;
    return this.recommendationsRepository.save(recommendation);
  }

  async deleteStaleRecommendations(userId: number): Promise<void> {
    await this.recommendationsRepository.delete(userId);
  }
}
