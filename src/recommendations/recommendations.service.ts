import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Recommendation } from './entities/recommendations.entity';

@Injectable()
export class RecommendationsService {
  constructor(
    @InjectRepository(Recommendation)
    private readonly recommendationsRepository: Repository<Recommendation>,
  ) {}

  async getForUser(userId: number): Promise<Recommendation[]> {
    const recs = await this.recommendationsRepository.find({
      where: { user_id: userId },
      relations: ['setting'],
    });

    if (!recs || recs.length === 0) {
      throw new NotFoundException(
        `Recommendations for user ${userId} not found.`,
      );
    }
    return recs;
  }
}
