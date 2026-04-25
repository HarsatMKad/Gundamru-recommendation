import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recommendation } from 'src/database/entities/recommendations.entity';
import { RecommendationSetting } from 'src/database/entities/recommendation-settings.entity';
import { AggregatorEngine } from './aggreagatorEngine.service';
import { UserEvent } from 'src/database/entities/user-event.entity';
import { RecommendationSettingsService } from 'src/recommendation/recommendation-settings.service';
import { ValidItemProvider } from './validItem.provider';
import { RecommenderSystemController } from './generation-system.controller';
import { RecommenderSystemService } from './generation-system.service';
import { RecommendationCalculatorService } from './recommendation.calculator.service';
import { DataService } from './data.service';
import { UserEventService } from 'src/user-events/user-events.service';
import { StrategyRegistry } from './strategy-registry';
import { GlobalPopularStrategy } from './strategy/global.strategys';
import { UserBasedCollabStrategy } from './strategy/personal.strategys';
import { ContentBasedStrategy } from './strategy/personal.strategys';
import { RecommenderOrchestrator } from './orchestrator.service';
import { I_PRODUCTS_SERVICE } from 'src/common/interface/entites.interface';
import { ProductService } from './products.service';
import { BatchWriter } from './batch-writer.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RecommendationSetting,
      Recommendation,
      UserEvent,
    ]),
  ],
  providers: [
    AggregatorEngine,
    RecommenderOrchestrator,
    RecommendationSettingsService,
    ValidItemProvider,
    RecommenderSystemService,
    RecommendationCalculatorService,
    DataService,
    UserEventService,
    StrategyRegistry,
    UserBasedCollabStrategy,
    ContentBasedStrategy,
    GlobalPopularStrategy,
    BatchWriter,
    {
      provide: I_PRODUCTS_SERVICE,
      useClass: ProductService,
    },
  ],
  exports: [StrategyRegistry],
  controllers: [RecommenderSystemController],
})
export class RecommenderSystemModule {}
