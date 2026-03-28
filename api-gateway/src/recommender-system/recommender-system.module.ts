import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recommendation } from 'src/recommendation/entities/recommendations.entity';
import { Product } from 'src/products/entities/product.entity';
import { RecommenderSetting } from 'src/recommendation-settings/entities/settings.entity';
import { PipelineEngine } from './pipeline-engine.service';
import { BatchWriter } from './batch-writer.service';
import { RecommenderOrchestrator } from './recommender-orchestrator.service';
import { UserEvent } from 'src/user-events/entities/user-event.entity';
import { RecommendationSettingsService } from 'src/recommendation-settings/recommendation-settings.service';
import { UsersModule } from 'src/users/users.module';
import { UserIdsProvider } from './user-ids.provider';
import { RecommenderSystemController } from './recommender-system.controller';
import { RecommenderSystemService } from './recommender-system.service';
import { RecommendationsModule } from 'src/recommendation/recommendations.module';
import { RecommendationCalculatorService } from './recommendation.calculator.service';
import { RecommendationDataService } from './recommendation-data.service';
import { UserEventService } from 'src/user-events/user-events.service';
import { StrategyRegistry } from './strategy-registry';
import { EventTypesModule } from 'src/event-types/event-types.module';
import { CollabStrategy } from './strategy/collab.strategy';
import { GlobalPopularStrategy } from './strategy/global.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Recommendation,
      Product,
      RecommenderSetting,
      UserEvent,
    ]),
    UsersModule,
    EventTypesModule,
    RecommendationsModule,
  ],
  providers: [
    PipelineEngine,
    BatchWriter,
    RecommenderOrchestrator,
    RecommendationSettingsService,
    UserIdsProvider,
    RecommenderSystemService,
    RecommendationCalculatorService,
    RecommendationDataService,
    UserEventService,
    StrategyRegistry,
    CollabStrategy,
    GlobalPopularStrategy,
  ],
  exports: [RecommenderOrchestrator],
  controllers: [RecommenderSystemController],
})
export class RecommenderSystemModule {}
