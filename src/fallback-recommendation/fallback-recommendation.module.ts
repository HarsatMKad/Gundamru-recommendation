import { Module } from '@nestjs/common';
import { FallbackRecommendationService } from './fallback-recommendation.service';
import { FallbackRecommendationController } from './fallback-recommendation.controller';
import { FallbackRecommendation } from './entities/fallback-recommendation.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([FallbackRecommendation])],
  providers: [FallbackRecommendationService],
  controllers: [FallbackRecommendationController],
  exports: [FallbackRecommendationService],
})
export class FallbackRecommendationModule {}
