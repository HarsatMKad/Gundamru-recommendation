import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { RecommendationService } from './recommendations.service';
import { RecQueryDto } from './dto/query-recommendation.dto';
import { RECOMMENDATION_ENDPOINTS } from 'src/common/util/request-param-handler.util';
import { PARAMS } from 'src/common/util/request-param-handler.util';

@Controller('recommendation')
export class RecommendationController {
  constructor(private readonly service: RecommendationService) {}

  @Get(`${RECOMMENDATION_ENDPOINTS.GET_FALLBACK}/:${PARAMS.CONTEXT}`)
  async getFallback(@Param(PARAMS.CONTEXT) context: string) {
    return await this.service.getFallback(context);
  }

  @Get(`:${PARAMS.CONTEXT}/:${PARAMS.MODE}/:${PARAMS.USERID}`)
  getRecommendations(
    @Param(PARAMS.CONTEXT) context: string, // Где
    @Param(PARAMS.MODE) mode: string, // Как
    @Param(PARAMS.USERID, ParseIntPipe) userId: number, // Кому
    @Query() query: RecQueryDto,
  ) {
    return this.service.getRecommendations(
      userId,
      context,
      mode,
      query.limit,
      query.minScore,
    );
  }
}
