import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './products/products.module';
import { UsersModule } from './users/users.module';
import { UserEventsModule } from './user-events/user-events.module';
import { RecommendationsModule } from './recommendation/recommendations.module';
import { RecommendationSettingsModule } from './recommendation-settings/recommendation-settings.module';
import { RecommenderSystemModule } from './recommender-system/recommender-system.module';
import { EventTypesModule } from './event-types/event-types.module';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE_NAME'),
        autoLoadEntities: true,
        synchronize: true, // не забыть в продакшене поставить false
      }),
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
