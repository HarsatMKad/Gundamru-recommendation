import { Module } from '@nestjs/common';
import { RecommendationSettingsService } from './recommendation-settings.service';
import { RecommendationSettingsController } from './recommendation-settings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecommendationSetting } from 'src/database/entities/recommendation-settings.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RecommendationSetting])],
  providers: [RecommendationSettingsService],
  controllers: [RecommendationSettingsController],
  exports: [RecommendationSettingsService],
})
export class RecommendationSettingsModule {}
