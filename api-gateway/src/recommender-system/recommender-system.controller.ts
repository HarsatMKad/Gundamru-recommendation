import { Controller, Get } from '@nestjs/common';
import { RecommenderSystemService } from './recommender-system.service';
import { RECOMMENDATION_ENDPOINTS } from 'src/common/util/request-param-handler.util';

@Controller('recommender-system')
export class RecommenderSystemController {
  constructor(private readonly service: RecommenderSystemService) {}

  @Get(RECOMMENDATION_ENDPOINTS.GENERATE)
  manualGenerateAll() {
    return this.service.triggerGenerationOrchestr();
  }
}
