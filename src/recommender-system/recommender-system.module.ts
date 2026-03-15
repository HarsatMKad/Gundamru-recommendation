import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recommendation } from 'src/recommendations/entities/recommendations.entity';
import { Product } from 'src/products/entities/product.entity';
import { RecommenderSetting } from 'src/recommendation-settings/entities/settings.entity';
import { PipelineEngine } from './pipeline-engine.service';
import { BatchWriter } from './batch-writer.service';
import { RecommenderOrchestrator } from './recommender-orchestrator.service';
import { UserEvent } from 'src/user-events/entities/user-event.entity';
import { RecommendationSettingsService } from 'src/recommendation-settings/recommendation-settings.service';
import { UsersModule } from 'src/users/users.module';
import { RecommenderSystemController } from './recommender-system.controller';
import { StrategyMetaService } from './strategy-meta.service';
import { UserIdsProvider } from './user-ids.provider';
import { PythonEngineClient } from './python-engine.client';
import { FallbackRecommendation } from 'src/fallback-recommendation/entities/fallback-recommendation.entity';
import { RecommenderOrchestratorFallback } from './recommender-orchestrator-fallback.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Recommendation,
      FallbackRecommendation,
      Product,
      RecommenderSetting,
      UserEvent,
    ]),
    UsersModule,
  ],
  providers: [
    PipelineEngine,
    BatchWriter,
    RecommenderOrchestrator,
    RecommenderOrchestratorFallback,
    StrategyMetaService,
    RecommendationSettingsService,
    UserIdsProvider,
    PythonEngineClient,
  ],
  exports: [RecommenderOrchestrator, RecommenderOrchestratorFallback],
  controllers: [RecommenderSystemController],
})
export class RecommenderSystemModule {}
