import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FallbackRecommendation } from './entities/fallback-recommendation.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class FallbackRecommendationService {
  constructor(
    @InjectRepository(FallbackRecommendation)
    private readonly recommendationsRepository: Repository<FallbackRecommendation>,
  ) {}

  async findAll() {
    return await this.recommendationsRepository.find();
  }

  async findById(id: number) {
    return await this.recommendationsRepository.findOneBy({ id });
  }

  async findByName(name: string) {
    return await this.recommendationsRepository.findOneBy({ name });
  }

  async deleteById(id: number) {
    const existing = await this.recommendationsRepository.findOne({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Fallback with id: "${id}" not found`);
    }
    await this.recommendationsRepository.delete({ id });

    return {
      message: `Fallback for id "${id}" successfully deleted`,
      deleted: true,
    };
  }
}
