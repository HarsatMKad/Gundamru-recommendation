import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recommendation } from 'src/database/entities/recommendations.entity';
import { Product } from 'src/database/entities/product.entity';
import { RecommendationSetting } from 'src/database/entities/recommendation-settings.entity';
import { PipelineEngine } from './pipeline-engine.service';
import { BatchWriter } from './batch-writer.service';
import { RecommenderOrchestrator } from './recommender-orchestrator.service';
import { UserEvent } from 'src/database/entities/user-event.entity';
import { RecommendationSettingsService } from 'src/recommendation-settings/recommendation-settings.service';
import { UsersModule } from 'src/users/users.module';
import { ValidItemProvider } from './validItem.provider';
import { RecommenderSystemController } from './recommender-system.controller';
import { RecommenderSystemService } from './recommender-system.service';
import { RecommendationsModule } from 'src/recommendation/recommendations.module';
import { RecommendationCalculatorService } from './recommendation.calculator.service';
import { IRecommendationDataService } from './recommendation-data.service';
import { UserEventService } from 'src/user-events/user-events.service';
import { StrategyRegistry } from './strategy-registry';
import { EventTypesModule } from 'src/event-types/event-types.module';
import { GlobalPopularStrategy } from './strategy/global.strategy';
import { ProductsModule } from 'src/products/products.module';
import { ItemBasedCollabStrategy } from './strategy/collab.item-based.strategy';
import { UserBasedCollabStrategy } from './strategy/collab.user-based.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Recommendation,
      Product,
      RecommendationSetting,
      UserEvent,
    ]),
    ProductsModule,
    UsersModule,
    EventTypesModule,
    RecommendationsModule,
  ],
  providers: [
    PipelineEngine,
    BatchWriter,
    RecommenderOrchestrator,
    RecommendationSettingsService,
    ValidItemProvider,
    RecommenderSystemService,
    RecommendationCalculatorService,
    IRecommendationDataService,
    UserEventService,
    StrategyRegistry,
    ItemBasedCollabStrategy,
    UserBasedCollabStrategy,
    GlobalPopularStrategy,
  ],
  exports: [RecommenderOrchestrator, StrategyRegistry],
  controllers: [RecommenderSystemController],
})
export class RecommenderSystemModule {}
