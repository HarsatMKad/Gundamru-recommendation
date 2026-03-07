import { Test, TestingModule } from '@nestjs/testing';
import { UserRecommendationsController } from './user-recommendations.controller';

describe('UserRecommendationsController', () => {
  let controller: UserRecommendationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserRecommendationsController],
    }).compile();

    controller = module.get<UserRecommendationsController>(
      UserRecommendationsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
