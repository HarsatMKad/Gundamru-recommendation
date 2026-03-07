import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  TargetContextType,
  UserRecommendation,
} from './entities/user-recommendation.entity';

@Injectable()
export class UserRecommendationsService {
  constructor(
    @InjectRepository(UserRecommendation)
    private readonly recommendationsRepository: Repository<UserRecommendation>,
  ) {}

  async getForUser(userId: number): Promise<UserRecommendation> {
    const recs = await this.recommendationsRepository.findOne({
      where: { userId },
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
  ): Promise<UserRecommendation> {
    const recommendation = new UserRecommendation();
    recommendation.userId = userId;
    recommendation.targetContext = targetContext;
    recommendation.recommended_skus = skus;
    return this.recommendationsRepository.save(recommendation);
  }

  async deleteStaleRecommendations(userId: number): Promise<void> {
    await this.recommendationsRepository.delete(userId);
  }
}
