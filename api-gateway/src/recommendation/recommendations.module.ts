import { Module } from '@nestjs/common';
import { RecommendationService } from './recommendations.service';
import { RecommendationController } from './recommendations.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recommendation } from 'src/database/entities/recommendations.entity';
import { RecommendationSetting } from 'src/database/entities/recommendation-settings.entity';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Recommendation, RecommendationSetting]),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ttl: parseInt(configService.get<string>('CACHE_TTL', '600'), 10) * 1000, // хранить кэш CACHE_TTL(10) минут
        max: parseInt(configService.get<string>('CACHE_MAX', '2000'), 10), // максимум CACHE_MAX(2000) записей в кэше
      }),
    }),
  ],
  providers: [RecommendationService],
  controllers: [RecommendationController],
  exports: [RecommendationService],
})
export class RecommendationsModule {}
