import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { UserRecommendationsService } from './user-recommendations.service';
import { UserRecommendation } from './entities/user-recommendation.entity';

@Controller('user-recommendations')
export class UserRecommendationsController {
  constructor(
    private readonly userRecommendationsService: UserRecommendationsService,
  ) {}

  @Get(':userId')
  async getRecommendations(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<UserRecommendation> {
    return this.userRecommendationsService.getForUser(userId);
  }
}
