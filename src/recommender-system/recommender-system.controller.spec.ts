import { Test, TestingModule } from '@nestjs/testing';
import { RecommenderSystemController } from './recommender-system.controller';

describe('RecommenderSystemController', () => {
  let controller: RecommenderSystemController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecommenderSystemController],
    }).compile();

    controller = module.get<RecommenderSystemController>(RecommenderSystemController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
