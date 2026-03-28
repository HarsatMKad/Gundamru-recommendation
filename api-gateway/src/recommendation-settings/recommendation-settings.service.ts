import { HttpStatus, Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecommendationSetting } from 'src/database/entities/recommendation-settings.entity';
import { UpdateRecommendationSettingDto } from './dto/update-recommendation-settings.dto';
import { CreateRecommendationSettingDto } from './dto/create-recommendation-settings.dto';
import { IRecommendationItem } from 'src/common/interface/recommendation.interface';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { EErrRecSetting } from 'src/common/enum/ErrHandler.enum';
import { ERestStatus } from 'src/common/enum/Rest.enum';
import { AVAILABLE_STRATEGIES } from 'src/common/const/ConstHandler.const';
import { StrategyScope } from 'src/common/enum/StrategyScope.enum';

@Injectable()
export class RecommendationSettingsService {
  constructor(
    @InjectRepository(RecommendationSetting)
    private settingsRepo: Repository<RecommendationSetting>,
  ) {}

  async getAll() {
    const items = await this.settingsRepo.find();
    return {
      code: HttpStatus.OK,
      message: ERestStatus.SUCCESS,
      data: items,
    };
  }

  async getById(id: string) {
    const setting = await this.settingsRepo.findOne({
      where: { id },
    });

    if (!setting) {
      throw new NotFoundException(
        `${EErrRecSetting.SETTINGS_NOT_FOUND} for id: ${id}`,
      );
    }

    return {
      code: HttpStatus.OK,
      message: ERestStatus.SUCCESS,
      data: setting,
    };
  }

  async getByContext(context: string) {
    const setting = await this.settingsRepo.findOne({
      where: { target_context: context },
    });

    if (!setting) {
      throw new NotFoundException(
        `${EErrRecSetting.SETTINGS_NOT_FOUND} for context: ${context}`,
      );
    }

    return {
      code: HttpStatus.OK,
      message: ERestStatus.SUCCESS,
      data: setting,
    };
  }

  async updateSettings(
    context: string,
    updateDto: UpdateRecommendationSettingDto,
  ) {
    const setting = await this.settingsRepo.findOne({
      where: { target_context: context },
    });

    if (!setting) {
      throw new NotFoundException(
        `${EErrRecSetting.SETTINGS_NOT_FOUND}. For context: ${context}`,
      );
    }

    Object.assign(setting, updateDto);
    const updated = await this.settingsRepo.save(setting);

    return {
      code: HttpStatus.OK,
      message: ERestStatus.UPDATED,
      data: updated,
    };
  }

  async createSettings(createDto: CreateRecommendationSettingDto) {
    const existing = await this.settingsRepo.findOne({
      where: { target_context: createDto.target_context },
    });
    if (existing) {
      throw new ConflictException(EErrRecSetting.SETTINGS_EXIST);
    }

    const newSettings = this.settingsRepo.create(createDto);
    const saved = await this.settingsRepo.save(newSettings);

    return {
      code: HttpStatus.CREATED,
      message: ERestStatus.CREATED,
      data: saved,
    };
  }

  async softDeleteSettingsByContext(context: string) {
    const existing = await this.settingsRepo.findOne({
      where: { target_context: context },
    });

    if (!existing) {
      throw new NotFoundException(EErrRecSetting.SETTINGS_NOT_FOUND);
    }

    await this.settingsRepo.delete({ target_context: context });

    existing.isActive = false;
    await this.settingsRepo.save(existing);

    return {
      code: HttpStatus.OK,
      message: ERestStatus.DEACTIVATED,
      data: {
        deactivated: true,
        context: context,
      },
    };
  }

  async deleteSettingsById(id: string) {
    const existing = await this.settingsRepo.findOne({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(EErrRecSetting.SETTINGS_NOT_FOUND);
    }

    await this.settingsRepo.delete({ id });

    return {
      code: HttpStatus.OK,
      message: ERestStatus.DELETED,
      data: {
        deleted: true,
      },
    };
  }

  async updateFallback(
    id: string,
    data: { fallback_skus: IRecommendationItem[]; fallback_updated_at: Date },
  ) {
    const setting = await this.settingsRepo.findOne({
      where: { id },
    });

    if (!setting) {
      throw new NotFoundException(
        `${EErrRecSetting.SETTINGS_NOT_FOUND} ID: ${id}`,
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
      message: ERestStatus.SUCCESS,
      data: updated,
    };
  }

  async getActiveConfigs() {
    const activeConfigs = await this.settingsRepo.find({
      where: { isActive: true },
    });

    return {
      code: HttpStatus.OK,
      message: ERestStatus.SUCCESS,
      data: activeConfigs,
    };
  }

  getStrategies(scope?: StrategyScope) {
    if (scope) {
      const validScopes = Object.values(StrategyScope);
      if (!validScopes.includes(scope)) {
        throw new BadRequestException(
          `${EErrRecSetting.INVALID_SCOPE}: ${scope}. Available scopes: ${validScopes.join(', ')}`,
        );
      }
    }
    return {
      code: HttpStatus.OK,
      message: ERestStatus.SUCCESS,
      data: AVAILABLE_STRATEGIES,
    };
  }
}
