import { Injectable } from '@nestjs/common';
import { ValidItemProvider } from './validItem.provider';
import { RecommendationSettingsService } from 'src/recommendation-settings/recommendation-settings.service';
import { UserEventService } from 'src/user-events/user-events.service';
import { IValidationData } from 'src/common/interface/recommendation.interface';

@Injectable()
export class IRecommendationDataService {
  constructor(
    private readonly settingsService: RecommendationSettingsService,
    private readonly userEventService: UserEventService,
    private readonly validItemProvider: ValidItemProvider,
  ) {}

  async getValidationData(): Promise<IValidationData> {
    const [activeConfigs, validUserIds, validIProductWithAttributes] =
      await Promise.all([
        this.settingsService.getActiveConfigs(),
        this.validItemProvider.getValidUserIds(),
        this.validItemProvider.getValidProductsWithAttributes(),
      ]);

    const productIds: string[] = validIProductWithAttributes.map(
      (item) => item.id,
    );

    const userEvents = await this.userEventService.getRelevantUserEvents(
      validUserIds,
      productIds,
    );

    return {
      activeConfigs,
      userEvents,
      productsWithAttributes: validIProductWithAttributes,
    };
  }
}
