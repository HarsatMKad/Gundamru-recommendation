import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recommendation } from 'src/recommendations/entities/recommendations.entity';
import { Product } from 'src/products/entities/product.entity';
import { RecommenderSetting } from 'src/recommendation-settings/entities/settings.entity';
import { StrategyFactory } from './strategy-factory.service';
import { PipelineEngine } from './pipeline-engine.service';
import { BatchWriter } from './batch-writer.service';
import { CollabStrategy } from './strategies/collab.strategy';
import { PopularStrategy } from './strategies/popular.strategy';
import { RecommenderOrchestrator } from './recommender-orchestrator.service';
import { UserEvent } from 'src/user-events/entities/user-event.entity';
import { RecommendationSettingsService } from 'src/recommendation-settings/recommendation-settings.service';
import { UsersModule } from 'src/users/users.module';
import { RecommenderSystemController } from './recommender-system.controller';
import { StrategyMetaService } from './strategy-meta.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Recommendation,
      Product,
      RecommenderSetting,
      UserEvent,
    ]),
    UsersModule,
  ],
  providers: [
    StrategyFactory,
    PipelineEngine,
    BatchWriter,
    CollabStrategy,
    PopularStrategy,
    RecommenderOrchestrator,
    StrategyMetaService,
    RecommendationSettingsService,
  ],
  exports: [RecommenderOrchestrator],
  controllers: [RecommenderSystemController],
})
export class RecommenderSystemModule {}
