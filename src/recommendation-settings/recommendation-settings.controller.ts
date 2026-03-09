import {
  Controller,
  Get,
  Body,
  Post,
  Param,
  UsePipes,
  ValidationPipe,
  Delete,
  Patch,
} from '@nestjs/common';
import { RecommendationSettingsService } from './recommendation-settings.service';
import { CreateRecommenderSettingDto } from './dto/create-recommendation-settings.dto';
import { UpdateRecommenderSettingDto } from './dto/update-recommendation-settings.dto';

@Controller('recommendation-settings')
export class RecommendationSettingsController {
  constructor(
    private readonly recommendationSettingsService: RecommendationSettingsService,
  ) {}

  @Get()
  getAll() {
    return this.recommendationSettingsService.findAll();
  }

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async create(@Body() createDto: CreateRecommenderSettingDto) {
    return await this.recommendationSettingsService.createSettings(createDto);
  }

  @Patch(':context')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async update(
    @Param('context') context: string,
    @Body() updateDto: UpdateRecommenderSettingDto,
  ) {
    return await this.recommendationSettingsService.updateSettings(
      context,
      updateDto,
    );
  }

  @Delete(':context')
  async delete(@Param('context') context: string) {
    return await this.recommendationSettingsService.deleteSettingsByContext(
      context,
    );
  }
}
