import { Test, TestingModule } from '@nestjs/testing';
import { FallbackRecommendationService } from './fallback-recommendation.service';

describe('FallbackRecommendationService', () => {
  let service: FallbackRecommendationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FallbackRecommendationService],
    }).compile();

    service = module.get<FallbackRecommendationService>(FallbackRecommendationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
