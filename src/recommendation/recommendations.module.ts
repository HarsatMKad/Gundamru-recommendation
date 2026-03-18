import { Module } from '@nestjs/common';
import { RecommendationService } from './recommendations.service';
import { RecommendationController } from './recommendations.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recommendation } from './entities/recommendations.entity';
import { RecommenderSetting } from 'src/recommendation-settings/entities/settings.entity';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    TypeOrmModule.forFeature([Recommendation, RecommenderSetting]),
    CacheModule.register({
      ttl: 10 * 60 * 1000, // хранить кэш 10 минут
      max: 1000, // максимум 1000 записей в кэше
    }),
  ],
  providers: [RecommendationService],
  controllers: [RecommendationController],
  exports: [RecommendationService],
})
export class RecommendationsModule {}
