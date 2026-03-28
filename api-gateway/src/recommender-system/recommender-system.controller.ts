import { Controller, Get } from '@nestjs/common';
import { RecommenderSystemService } from './recommender-system.service';

@Controller('recommender-system')
export class RecommenderSystemController {
  constructor(private readonly service: RecommenderSystemService) {}

  @Get('generate')
  manualGenerateAll() {
    return this.service.triggerGenerationOrchestr();
  }
}
