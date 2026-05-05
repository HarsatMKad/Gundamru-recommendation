import {
  Controller,
  Get,
  Body,
  Post,
  Param,
  UsePipes,
  Delete,
  Put,
} from '@nestjs/common';
import { RecommendationSettingsService } from './recommendation-settings.service';
import { CreateRecommendationSettingDto } from './dto/create-recommendation-settings.dto';
import { UpdateRecommendationSettingDto } from './dto/update-recommendation-settings.dto';
import {
  RecSettingFindByIdDto,
  RecSettingFindByNameDto,
} from './dto/query-recommendation.dto';

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
  findById(@Param() dto: RecSettingFindByIdDto) {
    return this.recSettingsService.getById(dto.id);
  }

  @Get('byType/:type')
  findByType(@Param() dto: RecSettingFindByNameDto) {
    return this.recSettingsService.getByType(dto.type);
  }

  @Post()
  @UsePipes()
  async create(@Body() createDto: CreateRecommendationSettingDto) {
    return await this.recSettingsService.createSettings(createDto);
  }

  @Put(`:id`)
  async update(
    @Param() idDto: RecSettingFindByIdDto,
    @Body() updateDto: UpdateRecommendationSettingDto,
  ) {
    return await this.recSettingsService.updateSettingsById(
      idDto.id,
      updateDto,
    );
  }

  @Delete(':id')
  async delete(@Param() idDto: RecSettingFindByIdDto) {
    return await this.recSettingsService.deleteSettingsById(idDto.id);
  }
}
