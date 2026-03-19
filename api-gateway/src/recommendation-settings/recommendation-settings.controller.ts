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
import { CreateRecommenderSettingDto } from './dto/create-recommendation-settings.dto';
import { UpdateRecommenderSettingDto } from './dto/update-recommendation-settings.dto';
import { StrategyScope } from 'src/common/config/strategies.config';
import {
  REC_SETTINGS_ENDPOINTS,
  PARAMS,
} from 'src/common/util/endpoint-handler.util';

@Controller('recommendation-settings')
export class RecommendationSettingsController {
  constructor(
    private readonly recSettingsService: RecommendationSettingsService,
  ) {}

  @Get()
  getAll() {
    return this.recSettingsService.findAll();
  }

  @Get(`:${PARAMS.ID}`)
  getById(@Param(PARAMS.ID) id: number) {
    return this.recSettingsService.getById(id);
  }

  @Get(REC_SETTINGS_ENDPOINTS.STRATEGIES)
  getStrategies(@Query(PARAMS.SCOPE) scope?: StrategyScope) {
    return this.recSettingsService.getStrategies(scope);
  }

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async create(@Body() createDto: CreateRecommenderSettingDto) {
    return await this.recSettingsService.createSettings(createDto);
  }

  @Patch(`:${PARAMS.CONTEXT}`)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async update(
    @Param(PARAMS.CONTEXT) context: string,
    @Body() updateDto: UpdateRecommenderSettingDto,
  ) {
    return await this.recSettingsService.updateSettings(context, updateDto);
  }

  @Delete(`:${PARAMS.CONTEXT}`)
  async delete(@Param(PARAMS.CONTEXT) context: string) {
    return await this.recSettingsService.softDeleteSettingsByContext(context);
  }
}
