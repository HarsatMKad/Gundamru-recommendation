import { Controller, Get, Param, Query } from '@nestjs/common';
import { RecommendationService } from './recommendations.service';
import {
  RecommendationParamsDto,
  RecommendationQueryDto,
} from './dto/query-recommendation.dto';
import { IRecommendationResponseSchema } from 'src/common/interface/recommendation.interface';

@Controller('api/recommendation')
export class RecommendationController {
  constructor(private readonly service: RecommendationService) {}

  @Get(`forUser/:settingId/:userId/:mode`)
  async getRecommendations(
    @Param() param: RecommendationParamsDto,
    @Query() query: RecommendationQueryDto,
  ): Promise<IRecommendationResponseSchema> {
    return await this.service.getRecommendations(param, query);
  }
}
