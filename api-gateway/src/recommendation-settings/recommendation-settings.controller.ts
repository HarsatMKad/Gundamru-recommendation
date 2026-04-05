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
  Query,
} from '@nestjs/common';
import { RecommendationSettingsService } from './recommendation-settings.service';
import { CreateRecommendationSettingDto } from './dto/create-recommendation-settings.dto';
import { UpdateRecommendationSettingDto } from './dto/update-recommendation-settings.dto';

@Controller('recommendation-settings')
export class RecommendationSettingsController {
  constructor(
    private readonly recSettingsService: RecommendationSettingsService,
  ) {}

  @Get()
  find(@Query(':id') id?: string, @Query('name') name?: string) {
    if (id) return this.recSettingsService.getById(id);
    if (name) return this.recSettingsService.getByContext(name);
    return this.recSettingsService.getAll();
  }

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async create(@Body() createDto: CreateRecommendationSettingDto) {
    return await this.recSettingsService.createSettings(createDto);
  }

  @Patch(`:name`)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async update(
    @Param('name') name: string,
    @Body() updateDto: UpdateRecommendationSettingDto,
  ) {
    return await this.recSettingsService.updateSettings(name, updateDto);
  }

  @Delete(':name')
  async delete(@Param('name') name: string) {
    return await this.recSettingsService.softDeleteSettingsByContext(name);
  }
}
