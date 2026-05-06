import { Controller, Get, Param, Query } from '@nestjs/common';
import { RecommendationService } from './recommendations.service';
import {
  RecommendationParamsDto,
  RecommendationQueryDto,
} from './dto/query-recommendation.dto';

@Controller('api/recommendation')
export class RecommendationController {
  constructor(private readonly service: RecommendationService) {}

  @Get(`forUser/:userId`)
  async getRecommendations(
    @Param() param: RecommendationParamsDto,
    @Query() query: RecommendationQueryDto,
  ) {
    return await this.service.getRecommendations(param, query);
  }
}
