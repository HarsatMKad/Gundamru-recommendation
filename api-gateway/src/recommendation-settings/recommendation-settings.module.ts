import { Module } from '@nestjs/common';
import { RecommendationSettingsService } from './recommendation-settings.service';
import { RecommendationSettingsController } from './recommendation-settings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecommenderSetting } from './entities/settings.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RecommenderSetting])],
  providers: [RecommendationSettingsService],
  controllers: [RecommendationSettingsController],
  exports: [RecommendationSettingsService],
})
export class RecommendationSettingsModule {}
