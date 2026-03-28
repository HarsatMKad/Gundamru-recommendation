import { Injectable, Logger } from '@nestjs/common';
import { UserIdsProvider } from './user-ids.provider';
import { RecommendationSettingsService } from 'src/recommendation-settings/recommendation-settings.service';
import { RecommendationService } from 'src/recommendation/recommendations.service';
import { UsersService } from 'src/users/users.service';
import { UserEventService } from 'src/user-events/user-events.service';
import {
  RecommendationData,
  ValidationData,
} from 'src/common/interface/recommendation.interface';
import { UserEvent } from 'src/user-events/entities/user-event.entity';

@Injectable()
export class RecommendationDataService {
  private readonly logger = new Logger(RecommendationDataService.name);

  constructor(
    private readonly settingsService: RecommendationSettingsService,
    private readonly recommendationService: RecommendationService,
    private readonly userService: UsersService,
    private readonly userEventService: UserEventService,
    private readonly userIdsProvider: UserIdsProvider,
  ) {}

  async getCalculationData(
    validUserIds: string[],
  ): Promise<RecommendationData> {
    this.logger.log('Начат процесс чтения данных');
    const [users, userEvents] = await Promise.all([
      this.userService.findAll(),
      this.userEventService.getRelevantUserEvents(validUserIds),
    ]);
    this.logger.log('Данные получены');
    return {
      users: users,
      userEvents: userEvents,
    };
  }

  async getRelevantEvents(validUserIds: string[]): Promise<UserEvent[]> {
    this.logger.log('Начат процесс чтения данных');
    return await this.userEventService.getRelevantUserEvents(validUserIds);
  }

  async getValidationData(): Promise<ValidationData> {
    this.logger.log('Начат процесс чтения данных');
    const [validUserIds, activeConfigs, inactiveRecIds] = await Promise.all([
      this.userIdsProvider.getValidUserIds(),
      this.settingsService.getActiveConfigs().then((r) => r.data),
      this.recommendationService.getInactiveRecommendationSettingIds(),
    ]);
    this.logger.log('Данные получены');
    return {
      validUserIds: validUserIds,
      activeConfigs: activeConfigs,
      inactiveRecIds: inactiveRecIds,
    };
  }
}
