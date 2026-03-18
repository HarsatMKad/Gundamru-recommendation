import { HttpStatus, Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecommenderSetting } from './entities/settings.entity';
import { UpdateRecommenderSettingDto } from './dto/update-recommendation-settings.dto';
import { CreateRecommenderSettingDto } from './dto/create-recommendation-settings.dto';
import { RecommendationItem } from 'src/common/interface/recommendation.interface';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { ERR_REC_SETTINGS } from 'src/common/util/err-handler.util';
import { REST_MESSAGES } from 'src/common/util/rest-message-handler.util';
import {
  AVAILABLE_STRATEGIES,
  StrategyScope,
} from 'src/common/config/strategies.config';

@Injectable()
export class RecommendationSettingsService {
  constructor(
    @InjectRepository(RecommenderSetting)
    private settingsRepo: Repository<RecommenderSetting>,
  ) {}

  async findAll() {
    const items = await this.settingsRepo.find();
    return {
      code: HttpStatus.OK,
      message: REST_MESSAGES.SUCCESS,
      data: items,
    };
  }

  async getById(id: number) {
    const setting = await this.settingsRepo.findOne({
      where: { id },
    });

    if (!setting) {
      throw new NotFoundException(
        `${ERR_REC_SETTINGS.SETTINGS_NOT_FOUND} for id: ${id}`,
      );
    }

    return {
      code: HttpStatus.OK,
      message: REST_MESSAGES.SUCCESS,
      data: setting,
    };
  }

  async updateSettings(
    context: string,
    updateDto: UpdateRecommenderSettingDto,
  ) {
    const setting = await this.settingsRepo.findOne({
      where: { target_context: context },
    });

    if (!setting) {
      throw new NotFoundException(
        `${ERR_REC_SETTINGS.SETTINGS_NOT_FOUND}. For context: ${context}`,
      );
    }

    Object.assign(setting, updateDto);
    const updated = await this.settingsRepo.save(setting);

    return {
      code: HttpStatus.OK,
      message: REST_MESSAGES.UPDATED,
      data: updated,
    };
  }

  async createSettings(createDto: CreateRecommenderSettingDto) {
    const existing = await this.settingsRepo.findOne({
      where: { target_context: createDto.target_context },
    });
    if (existing) {
      throw new ConflictException(ERR_REC_SETTINGS.SETTINGS_EXIST);
    }

    const newSettings = this.settingsRepo.create(createDto);
    const saved = await this.settingsRepo.save(newSettings);

    return {
      code: HttpStatus.CREATED,
      message: REST_MESSAGES.CREATED,
      data: saved,
    };
  }

  async getInactiveSettingIds() {
    const inactiveSettings = await this.settingsRepo.find({
      where: { isActive: false },
      select: ['id'],
    });
    const ids = inactiveSettings.map((s) => s.id);

    return {
      code: HttpStatus.OK,
      message: REST_MESSAGES.SUCCESS,
      data: ids,
    };
  }

  async softDeleteSettingsByContext(context: string) {
    const existing = await this.settingsRepo.findOne({
      where: { target_context: context },
    });

    if (!existing) {
      throw new NotFoundException(ERR_REC_SETTINGS.SETTINGS_NOT_FOUND);
    }

    await this.settingsRepo.delete({ target_context: context });

    existing.isActive = false;
    await this.settingsRepo.save(existing);

    return {
      code: HttpStatus.OK,
      message: REST_MESSAGES.DEACTIVATED,
      data: {
        deactivated: true,
        context: context,
      },
    };
  }

  async deleteSettingsById(id: number) {
    const existing = await this.settingsRepo.findOne({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(ERR_REC_SETTINGS.SETTINGS_NOT_FOUND);
    }

    await this.settingsRepo.delete({ id });

    return {
      code: HttpStatus.OK,
      message: REST_MESSAGES.DELETED,
      data: {
        deleted: true,
      },
    };
  }

  async updateFallback(
    id: number,
    data: { fallback_skus: RecommendationItem[]; fallback_updated_at: Date },
  ) {
    const setting = await this.settingsRepo.findOne({
      where: { id },
    });

    if (!setting) {
      throw new NotFoundException(
        `${ERR_REC_SETTINGS.SETTINGS_NOT_FOUND} ID: ${id}`,
      );
    }

    await this.settingsRepo.update(id, {
      fallback_skus: data.fallback_skus,
      fallback_updated_at: data.fallback_updated_at,
    });

    const updated = await this.settingsRepo.findOne({
      where: { id },
    });

    return {
      code: HttpStatus.OK,
      message: REST_MESSAGES.SUCCESS,
      data: updated,
    };
  }

  async getActiveConfigs() {
    const activeConfigs = await this.settingsRepo.find({
      where: { isActive: true },
    });

    return {
      code: HttpStatus.OK,
      message: REST_MESSAGES.SUCCESS,
      data: activeConfigs,
    };
  }

  getStrategies(scope?: StrategyScope) {
    if (scope) {
      const validScopes = Object.values(StrategyScope);
      if (!validScopes.includes(scope)) {
        throw new BadRequestException(
          `${ERR_REC_SETTINGS.INVALID_SCOPE}: ${scope}. Available scopes: ${validScopes.join(', ')}`,
        );
      }
    }

    return {
      code: HttpStatus.OK,
      message: REST_MESSAGES.SUCCESS,
      data: AVAILABLE_STRATEGIES,
    };
  }
}
