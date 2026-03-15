import { Test, TestingModule } from '@nestjs/testing';
import { FallbackRecommendationController } from './fallback-recommendation.controller';

describe('FallbackRecommendationController', () => {
  let controller: FallbackRecommendationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FallbackRecommendationController],
    }).compile();

    controller = module.get<FallbackRecommendationController>(FallbackRecommendationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
