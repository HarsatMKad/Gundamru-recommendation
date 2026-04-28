import {
  Controller,
  Get,
  Body,
  Post,
  Param,
  UsePipes,
  Delete,
  Patch,
} from '@nestjs/common';
import { RecommendationSettingsService } from './recommendation-settings.service';
import { CreateRecommendationSettingDto } from './dto/create-recommendation-settings.dto';
import { UpdateRecommendationSettingDto } from './dto/update-recommendation-settings.dto';
import { RecSettingByIdDto } from './dto/query-recommendation.dto';

@Controller('api/recommendation/settings')
export class RecommendationSettingsController {
  constructor(
    private readonly recSettingsService: RecommendationSettingsService,
  ) {}

  @Get()
  findAll() {
    return this.recSettingsService.getAll();
  }

  @Get(':id')
  findById(@Param() idDto: RecSettingByIdDto) {
    return this.recSettingsService.getById(idDto.id);
  }

  @Post()
  @UsePipes()
  async create(@Body() createDto: CreateRecommendationSettingDto) {
    return await this.recSettingsService.createSettings(createDto);
  }

  @Patch(`:id`)
  async update(
    @Param() idDto: RecSettingByIdDto,
    @Body() updateDto: UpdateRecommendationSettingDto,
  ) {
    return await this.recSettingsService.updateSettingsById(
      idDto.id,
      updateDto,
    );
  }

  @Delete(':id')
  async delete(@Param() idDto: RecSettingByIdDto) {
    return await this.recSettingsService.softDeleteSettingsById(idDto.id);
  }
}
