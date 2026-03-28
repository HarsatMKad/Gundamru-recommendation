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
import { StrategyScope } from 'src/common/enum/StrategyScope.enum';

@Controller('recommendation-settings')
export class RecommendationSettingsController {
  constructor(
    private readonly recSettingsService: RecommendationSettingsService,
  ) {}

  @Get()
  find(@Query(':id') id?: string, @Query('context') context?: string) {
    if (id) return this.recSettingsService.getById(id);
    if (context) return this.recSettingsService.getByContext(context);
    return this.recSettingsService.getAll();
  }

  @Get('strategies')
  getStrategies(@Query('scope') scope?: StrategyScope) {
    return this.recSettingsService.getStrategies(scope);
  }

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async create(@Body() createDto: CreateRecommendationSettingDto) {
    return await this.recSettingsService.createSettings(createDto);
  }

  @Patch(`:context`)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async update(
    @Param('context') context: string,
    @Body() updateDto: UpdateRecommendationSettingDto,
  ) {
    return await this.recSettingsService.updateSettings(context, updateDto);
  }

  @Delete(':context')
  async delete(@Param('context') context: string) {
    return await this.recSettingsService.softDeleteSettingsByContext(context);
  }
}
