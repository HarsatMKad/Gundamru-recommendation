import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';
import { Recommendation } from './entities/recommendations.entity';

@Controller('user-recommendations')
export class RecommendationsController {
  constructor(private readonly service: RecommendationsService) {}

  @Get(':userId')
  async getRecommendationsForUser(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<Recommendation[]> {
    return this.service.getForUser(userId);
  }
}
