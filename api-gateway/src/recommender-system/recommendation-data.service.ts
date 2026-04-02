import { Injectable } from '@nestjs/common';
import { ValidItemProvider } from './validItem.provider';
import { RecommendationSettingsService } from 'src/recommendation-settings/recommendation-settings.service';
import { RecommendationService } from 'src/recommendation/recommendations.service';
import { UserEventService } from 'src/user-events/user-events.service';
import { IValidationData } from 'src/common/interface/recommendation.interface';

@Injectable()
export class IRecommendationDataService {
  constructor(
    private readonly settingsService: RecommendationSettingsService,
    private readonly recommendationService: RecommendationService,
    private readonly userEventService: UserEventService,
    private readonly validItemProvider: ValidItemProvider,
  ) {}

  async getValidationData(): Promise<IValidationData> {
    const [validUserIds, validProductIds, activeConfigs, inactiveRecIds] =
      await Promise.all([
        this.validItemProvider.getValidUserIds(),
        this.validItemProvider.getValidProductIds(),
        this.settingsService.getActiveConfigs().then((r) => r.data),
        this.recommendationService.getActiveRecommendationSettingIds(),
      ]);

    const userEvents = await this.userEventService.getRelevantUserEvents(
      validUserIds,
      validProductIds,
    );

    return {
      activeConfigs: activeConfigs,
      inactiveRecIds: inactiveRecIds,
      userEvents: userEvents,
    };
  }
}
