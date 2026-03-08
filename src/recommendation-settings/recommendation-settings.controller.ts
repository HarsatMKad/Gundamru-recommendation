import { Controller, Get, Body, Post, Param } from '@nestjs/common';
import { RecommendationSettingsService } from './recommendation-settings.service';

@Controller('recommendation-settings')
export class RecommendationSettingsController {
  constructor(
    private readonly recommendationSettingsService: RecommendationSettingsService,
  ) {}

  @Get()
  getAll() {
    return this.recommendationSettingsService.findAll();
  }

  @Post(':context')
  update(
    @Param('context') context: string,
    @Body() body: { methods: { name: string; weight: number }[] },
  ) {
    return this.recommendationSettingsService.updateSettings(
      context,
      body.methods,
    );
  }
}
