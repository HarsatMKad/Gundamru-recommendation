import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recommendation } from 'src/database/entities/recommendations.entity';
import { RecommendationSetting } from 'src/database/entities/recommendation-settings.entity';
import { PipelineEngine } from './pipeline-engine.service';
import { UserEvent } from 'src/database/entities/user-event.entity';
import { RecommendationSettingsService } from 'src/recommendation-settings/recommendation-settings.service';
import { ValidItemProvider } from './validItem.provider';
import { RecommenderSystemController } from './recommender-system.controller';
import { RecommenderSystemService } from './recommender-system.service';
import { RecommendationCalculatorService } from './recommendation.calculator.service';
import { RecommendationDataService } from './recommendation-data.service';
import { UserEventService } from 'src/user-events/user-events.service';
import { StrategyRegistry } from './strategy-registry';
import { GlobalPopularStrategy } from './strategy/global.strategys';
import { UserBasedCollabStrategy } from './strategy/personal.strategys';
import { ContentBasedStrategy } from './strategy/personal.strategys';
import { RecommendationsModule } from 'src/recommendation/recommendations.module';
import { RecommenderOrchestrator } from './recommender-orchestrator.service';
import { I_PRODUCTS_SERVICE } from 'src/common/interface/entites.interface';
import { ProductService } from './products.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Recommendation,
      RecommendationSetting,
      UserEvent,
    ]),
    RecommendationsModule,
  ],
  providers: [
    PipelineEngine,
    RecommenderOrchestrator,
    RecommendationSettingsService,
    ValidItemProvider,
    RecommenderSystemService,
    RecommendationCalculatorService,
    RecommendationDataService,
    UserEventService,
    StrategyRegistry,
    UserBasedCollabStrategy,
    ContentBasedStrategy,
    GlobalPopularStrategy,
    {
      provide: I_PRODUCTS_SERVICE,
      useClass: ProductService,
    },
  ],
  exports: [StrategyRegistry],
  controllers: [RecommenderSystemController],
})
export class RecommenderSystemModule {}
