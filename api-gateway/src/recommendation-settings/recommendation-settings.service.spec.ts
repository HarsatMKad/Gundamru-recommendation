import { Test, TestingModule } from '@nestjs/testing';
import { RecommendationSettingsService } from './recommendation-settings.service';

describe('RecommendationSettingsService', () => {
  let service: RecommendationSettingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RecommendationSettingsService],
    }).compile();

    service = module.get<RecommendationSettingsService>(
      RecommendationSettingsService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
