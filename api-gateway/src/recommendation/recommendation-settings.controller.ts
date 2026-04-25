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
import { CreateRecommendationSettingDto } from './dto/create-recommendation-settings.dto';
import { UpdateRecommendationSettingDto } from './dto/update-recommendation-settings.dto';

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
  findById(@Param('id') id: string) {
    return this.recSettingsService.getById(id);
  }

  @Get(':name')
  findByName(@Param('name') name: string) {
    return this.recSettingsService.getByContext(name);
  }

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async create(@Body() createDto: CreateRecommendationSettingDto) {
    return await this.recSettingsService.createSettings(createDto);
  }

  @Patch(`:id`)
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateRecommendationSettingDto,
  ) {
    return await this.recSettingsService.updateSettingsById(id, updateDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.recSettingsService.softDeleteSettingsById(id);
  }
}
