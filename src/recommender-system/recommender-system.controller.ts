import { Controller } from '@nestjs/common';
import { Get } from '@nestjs/common';
import { StrategyMetaService } from './strategy-meta.service';

@Controller('recommendations/meta')
export class RecommenderSystemController {
  constructor(private readonly metaService: StrategyMetaService) {}

  @Get('strategies')
  getStrategies() {
    return this.metaService.getAvailableStrategies();
  }
}
