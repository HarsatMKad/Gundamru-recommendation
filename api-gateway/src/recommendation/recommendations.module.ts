import { Module } from '@nestjs/common';
import { RecommendationService } from './recommendations.service';
import { RecommendationController } from './recommendations.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recommendation } from 'src/database/entities/recommendations.entity';
import { RecommendationSetting } from 'src/database/entities/recommendation-settings.entity';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';
import { ICacheConfig } from 'src/common/interface/config.interface';
import { EConfigKey } from 'src/common/enum/ConfigKey.enum';
import { RecommenderSystemModule } from 'src/generation-system/generation-system.module';
import { RecommendationSettingsService } from './recommendation-settings.service';
import { IsStrategyForScope } from './scope-validator.util';
import { RecommendationSettingsController } from './recommendation-settings.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Recommendation, RecommendationSetting]),
    RecommenderSystemModule,
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ttl:
          configService.get<ICacheConfig>(EConfigKey.cache)?.ttl ?? 600 * 1000, // как долго хранить кэш. В конфиге указаны секунды
        max: configService.get<ICacheConfig>(EConfigKey.cache)?.max ?? 2000, // максимум CACHE_MAX(2000) записей в кэше
      }),
    }),
  ],
  providers: [
    RecommendationService,
    RecommendationSettingsService,
    IsStrategyForScope,
  ],
  controllers: [RecommendationController, RecommendationSettingsController],
  exports: [RecommendationService, RecommendationSettingsService],
})
export class RecommendationsModule {}
