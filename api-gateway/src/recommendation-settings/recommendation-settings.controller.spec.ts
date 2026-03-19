import { Test, TestingModule } from '@nestjs/testing';
import { RecommendationSettingsController } from './recommendation-settings.controller';

describe('RecommendationSettingsController', () => {
  let controller: RecommendationSettingsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecommendationSettingsController],
    }).compile();

    controller = module.get<RecommendationSettingsController>(
      RecommendationSettingsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
