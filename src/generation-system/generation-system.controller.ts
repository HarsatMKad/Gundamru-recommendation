import { Controller, Get } from '@nestjs/common';
import { RecommenderSystemService } from './generation-system.service';

@Controller('api/recommendation-system')
export class RecommenderSystemController {
  constructor(private readonly service: RecommenderSystemService) {}

  @Get('generate')
  manualGenerate() {
    return this.service.triggerGeneration();
  }

  @Get('generate/status')
  getGenerateStatus() {
    return this.service.getGenerationStatus();
  }

  @Get('strategys')
  getAllStrategys() {
    return this.service.getAllStrategys();
  }
}
