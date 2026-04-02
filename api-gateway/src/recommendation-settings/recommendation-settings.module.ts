import { Module } from '@nestjs/common';
import { RecommendationSettingsService } from './recommendation-settings.service';
import { RecommendationSettingsController } from './recommendation-settings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecommendationSetting } from 'src/database/entities/recommendation-settings.entity';
import { IsStrategyForScope } from './scope-validator.util';
import { RecommenderSystemModule } from 'src/recommender-system/recommender-system.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RecommendationSetting]),
    RecommenderSystemModule,
  ],
  providers: [RecommendationSettingsService, IsStrategyForScope],
  controllers: [RecommendationSettingsController],
  exports: [RecommendationSettingsService],
})
export class RecommendationSettingsModule {}
