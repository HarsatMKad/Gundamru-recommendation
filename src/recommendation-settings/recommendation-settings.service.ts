import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecommenderSetting } from './entities/settings.entity';

@Injectable()
export class RecommendationSettingsService {
  constructor(
    @InjectRepository(RecommenderSetting)
    private settingsRepo: Repository<RecommenderSetting>,
  ) {}

  async findAll() {
    return await this.settingsRepo.find();
  }

  async updateSettings(
    target_context: string,
    methods: { name: string; weight: number }[],
  ) {
    return await this.settingsRepo.save({ target_context, methods });
  }

  async getByContext(context: string) {
    return await this.settingsRepo.findOne({
      where: { target_context: context },
    });
  }
}
