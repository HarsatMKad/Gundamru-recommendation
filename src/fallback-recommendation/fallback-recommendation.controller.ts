import { Controller, Delete, Get, Param } from '@nestjs/common';
import { FallbackRecommendationService as FallbackService } from './fallback-recommendation.service';

@Controller('fallback-recommendation')
export class FallbackRecommendationController {
  constructor(private readonly service: FallbackService) {}

  @Get()
  async findAll() {
    return await this.service.findAll();
  }

  @Get(':id')
  async findOneById(@Param('id') id: number) {
    return await this.service.findById(id);
  }

  @Get(':name')
  async findOneByName(@Param('name') name: string) {
    return await this.service.findByName(name);
  }

  @Delete(':id')
  async deleteById(@Param('id') id: number) {
    return await this.service.deleteById(id);
  }
}
