import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './products/products.module';
import { UsersModule } from './users/users.module';
import { UserEventsModule } from './user-events/user-events.module';
import { RecommendationsModule } from './recommendations/recommendations.module';
import { RecommendationSettingsModule } from './recommendation-settings/recommendation-settings.module';
import { RecommenderSystemModule } from './recommender-system/recommender-system.module';
import { EventTypesModule } from './event-types/event-types.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'db',
      port: 5432,
      username: 'harsat',
      password: 'admin',
      database: 'gundamru-recommendation',
      autoLoadEntities: true,
      synchronize: true,
    }),
    ProductsModule,
    UsersModule,
    UserEventsModule,
    RecommendationsModule,
    RecommendationSettingsModule,
    RecommenderSystemModule,
    EventTypesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
