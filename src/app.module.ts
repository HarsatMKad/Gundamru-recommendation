import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './products/products.module';
import { UsersModule } from './users/users.module';
import { UserEventsModule } from './user-events/user-events.module';
import { UserRecommendationsModule } from './user-recommendations/user-recommendations.module';

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
    UserRecommendationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
