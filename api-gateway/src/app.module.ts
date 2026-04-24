import { Module, Provider } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEventsModule } from './user-events/user-events.module';
import { RecommendationsModule } from './recommendation/recommendations.module';
import { RecommendationSettingsModule } from './recommendation-settings/recommendation-settings.module';
import { RecommenderSystemModule } from './recommender-system/recommender-system.module';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';
import configLoader from './common/config/ConfigLoader';
import { IDatabaseConfig } from './common/interface/config.interface';
import { EConfigKey } from './common/enum/ConfigKey.enum';
import { ApiKeyGuard } from './common/util/api-key.guard.util';
import { APP_GUARD } from '@nestjs/core';

const globalGuardProvider: Provider<ApiKeyGuard> = {
  provide: APP_GUARD,
  useClass: ApiKeyGuard,
};

@Module({
  imports: [
    ConfigModule.forRoot({ load: [configLoader], isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbConfig = configService.get<IDatabaseConfig>(
          EConfigKey.database,
        );
        return {
          type: 'postgres',
          host: dbConfig?.host,
          port: dbConfig?.port,
          username: dbConfig?.username,
          password: dbConfig?.password,
          database: dbConfig?.name,
          autoLoadEntities: true,
          synchronize: true, // не забыть поставить false
          migrationsRun: false, // не забыть поставить false
        };
      },
    }),
    UserEventsModule,
    RecommendationsModule,
    RecommendationSettingsModule,
    RecommenderSystemModule,
  ],
  controllers: [AppController],
  providers: [AppService, globalGuardProvider],
})
export class AppModule {}
