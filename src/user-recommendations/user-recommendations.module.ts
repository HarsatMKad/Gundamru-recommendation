import { Module } from '@nestjs/common';
import { UserRecommendationsService } from './user-recommendations.service';
import { UserRecommendationsController } from './user-recommendations.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRecommendation } from './entities/user-recommendation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserRecommendation])],
  providers: [UserRecommendationsService],
  controllers: [UserRecommendationsController],
  exports: [UserRecommendationsService],
})
export class UserRecommendationsModule {}
