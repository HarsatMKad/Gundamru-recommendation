import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecommenderSetting } from './entities/settings.entity';
import { UpdateRecommenderSettingDto } from './dto/update-recommendation-settings.dto';
import { CreateRecommenderSettingDto } from './dto/create-recommendation-settings.dto';
import { NotFoundException, ConflictException } from '@nestjs/common';

@Injectable()
export class RecommendationSettingsService {
  constructor(
    @InjectRepository(RecommenderSetting)
    private settingsRepo: Repository<RecommenderSetting>,
  ) {}

  private getDescription(name: string): string {
    switch (name) {
      case 'collab':
        return 'Рекомендации на основе схожести пользователей.';
      case 'popular':
        return 'Рекомендации на основе общей популярности товаров.';
      default:
        return 'Неизвестная стратегия.';
    }
  }

  async findAll() {
    return await this.settingsRepo.find();
  }

  async updateSettings(
    context: string,
    updateDto: UpdateRecommenderSettingDto,
  ) {
    const setting = await this.settingsRepo.findOne({
      where: { target_context: context },
    });

    if (!setting) {
      throw new NotFoundException(`Setting for context ${context} not found`);
    }

    Object.assign(setting, updateDto);
    return await this.settingsRepo.save(setting);
  }

  async createSettings(createDto: CreateRecommenderSettingDto) {
    const existing = await this.getByContext(createDto.target_context);
    if (existing) {
      throw new ConflictException(
        `Settings for context "${createDto.target_context}" already exist`,
      );
    }

    const newSettings = this.settingsRepo.create(createDto);
    return await this.settingsRepo.save(newSettings);
  }

  async getByContext(context: string) {
    return await this.settingsRepo.findOne({
      where: { target_context: context },
    });
  }

  async getById(id: number) {
    return await this.settingsRepo.findOne({
      where: { id },
    });
  }

  async getInactiveSettingIds(): Promise<number[]> {
    const inactiveSettings = await this.settingsRepo.find({
      where: { isActive: false },
      select: ['id'],
    });
    return inactiveSettings.map((s) => s.id);
  }

  async deleteSettingsByContext(context: string) {
    const existing = await this.settingsRepo.findOne({
      where: { target_context: context },
    });

    if (!existing) {
      throw new NotFoundException(
        `Settings for context "${context}" not found`,
      );
    }

    await this.settingsRepo.delete({ target_context: context });

    return {
      message: `Settings for context "${context}" successfully deleted`,
      deleted: true,
    };
  }

  async deleteSettingsById(id: number) {
    const existing = await this.settingsRepo.findOne({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Settings for id "${id}" not found`);
    }

    await this.settingsRepo.delete({ id });

    return {
      message: `Settings for id "${id}" successfully deleted`,
      deleted: true,
    };
  }

  async getActiveConfigs(): Promise<RecommenderSetting[]> {
    return this.settingsRepo.find({
      where: { isActive: true },
    });
  }
}
