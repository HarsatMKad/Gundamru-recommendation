import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecommendationSetting } from 'src/database/entities/recommendation-settings.entity';
import { UpdateRecommendationSettingDto } from './dto/update-recommendation-settings.dto';
import { CreateRecommendationSettingDto } from './dto/create-recommendation-settings.dto';
import { IRecommendationItem } from 'src/common/interface/recommendation.interface';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { EErrRecSetting } from 'src/common/enum/ErrHandler.enum';

@Injectable()
export class RecommendationSettingsService {
  constructor(
    @InjectRepository(RecommendationSetting)
    private settingsRepo: Repository<RecommendationSetting>,
  ) {}

  async getAll() {
    return await this.settingsRepo.find();
  }

  async getById(id: string) {
    return await this.settingsRepo.findOne({
      where: { id },
    });
  }

  async getByContext(context: string) {
    return await this.settingsRepo.findOne({
      where: { target_context: context },
    });
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
    return await this.settingsRepo.save(setting);
  }

  async createSettings(createDto: CreateRecommendationSettingDto) {
    const existing = await this.settingsRepo.findOne({
      where: { target_context: createDto.target_context },
    });
    if (existing) {
      throw new ConflictException(EErrRecSetting.SETTINGS_EXIST);
    }

    const newSettings = this.settingsRepo.create(createDto);
    return await this.settingsRepo.save(newSettings);
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
      deactivated: true,
      context: context,
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

    return await this.settingsRepo.findOne({
      where: { id },
    });
  }

  async getActiveConfigs() {
    return await this.settingsRepo.find({
      where: { isActive: true },
    });
  }
}
