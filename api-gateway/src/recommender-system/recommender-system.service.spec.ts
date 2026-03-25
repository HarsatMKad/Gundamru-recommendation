import { Test, TestingModule } from '@nestjs/testing';
import { RecommenderSystemService } from './recommender-system.service';

describe('RecommenderSystemService', () => {
  let service: RecommenderSystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RecommenderSystemService],
    }).compile();

    service = module.get<RecommenderSystemService>(RecommenderSystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
