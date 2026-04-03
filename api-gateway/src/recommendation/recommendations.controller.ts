import { Controller, Get, Param, Query } from '@nestjs/common';
import { RecommendationService } from './recommendations.service';
import { RecQueryDto } from './dto/query-recommendation.dto';

@Controller('recommendation')
export class RecommendationController {
  constructor(private readonly service: RecommendationService) {}

  @Get(`fallback/:context`)
  async getFallback(@Param('context') context: string) {
    return await this.service.getFallback(context);
  }

  @Get(`:context/:mode/:userId`)
  async getRecommendations(
    @Param('context') context: string, // Где
    @Param('mode') mode: string, // Как
    @Param('userId') userId: string, // Кому
    @Query() query: RecQueryDto,
  ) {
    return await this.service.getRecommendations(
      userId,
      context,
      mode,
      query.limit,
      query.minScore,
    );
  }

  @Get(`/all`)
  async getAllRecommendations(
    @Query('limit') limit: number = 100,
    @Query('userId') userId?: string,
  ) {
    return await this.service.getAllRecommendations(limit, userId);
  }
}
