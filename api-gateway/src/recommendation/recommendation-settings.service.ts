import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecommendationSetting } from 'src/database/entities/recommendation-settings.entity';
import { UpdateRecommendationSettingDto } from './dto/update-recommendation-settings.dto';
import { CreateRecommendationSettingDto } from './dto/create-recommendation-settings.dto';
import { IRecommendationItem } from 'src/common/interface/recommendation.interface';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { EErrorHandler } from 'src/common/enum/ErrHandler.enum';

@Injectable()
export class RecommendationSettingsService {
  constructor(
    @InjectRepository(RecommendationSetting)
    private settingsRepo: Repository<RecommendationSetting>,
  ) {}

  async getAll() {
    const items = await this.settingsRepo.find({
      order: {
        isActive: 'DESC',
        createdAt: 'DESC',
      },
    });

    const itemsResponse = items.map((item) => ({
      id: item.id,
      name: item.name,
      fallbackStrategy: item.fallbackStrategy,
      fallbackWeight: item.fallbackWeight,
      personalMethods: item.personalMethods,
      isActive: item.isActive,
      createdAt: item.createdAt,
    }));
    return { items: itemsResponse, total: items.length };
  }

  async getById(id: string) {
    return await this.settingsRepo.findOneBy({ id });
  }

  async getByName(name: string) {
    return await this.settingsRepo.findOneBy({ name });
  }

  async updateSettingsById(
    id: string,
    updateDto: UpdateRecommendationSettingDto,
  ) {
    const setting = await this.settingsRepo.findOneBy({ id });

    if (!setting) {
      throw new NotFoundException(
        `${EErrorHandler.SETTINGS_NOT_FOUND}. For context: ${id}`,
      );
    }

    Object.assign(setting, updateDto);
    return await this.settingsRepo.save(setting);
  }

  async createSettings(createDto: CreateRecommendationSettingDto) {
    const existing = await this.settingsRepo.findOne({
      where: { name: createDto.name },
    });
    if (existing) {
      throw new ConflictException(EErrorHandler.SETTINGS_EXIST);
    }

    const newSettings = this.settingsRepo.create(createDto);
    return await this.settingsRepo.save(newSettings);
  }

  async deleteSettingsById(id: string) {
    const existing = await this.settingsRepo.findOneBy({ id });

    if (!existing) {
      throw new NotFoundException(EErrorHandler.SETTINGS_NOT_FOUND);
    }

    await this.settingsRepo.delete({ id });
    return existing;
  }

  async updateFallback(
    id: string,
    data: { fallbackSkus: IRecommendationItem[]; fallbackUpdatedAt: Date },
  ) {
    const setting = await this.settingsRepo.findOne({
      where: { id },
    });

    if (!setting) {
      throw new NotFoundException(
        `${EErrorHandler.SETTINGS_NOT_FOUND} ID: ${id}`,
      );
    }

    await this.settingsRepo.update(id, {
      fallbackSkus: data.fallbackSkus,
      fallbackUpdatedAt: data.fallbackUpdatedAt,
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
