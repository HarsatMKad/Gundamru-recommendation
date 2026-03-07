import { Test, TestingModule } from '@nestjs/testing';
import { UserRecommendationsService } from './user-recommendations.service';

describe('UserRecommendationsService', () => {
  let service: UserRecommendationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserRecommendationsService],
    }).compile();

    service = module.get<UserRecommendationsService>(
      UserRecommendationsService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
