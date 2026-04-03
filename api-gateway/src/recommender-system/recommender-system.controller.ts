import { Controller, Get } from '@nestjs/common';
import { RecommenderSystemService } from './recommender-system.service';

@Controller('recommendation-system')
export class RecommenderSystemController {
  constructor(private readonly service: RecommenderSystemService) {}

  @Get('generate')
  manualGenerate() {
    return this.service.triggerGeneration();
  }

  @Get('strategys')
  getAllStrategys() {
    return this.service.getAllStrategys();
  }
}
