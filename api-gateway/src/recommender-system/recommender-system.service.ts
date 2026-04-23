import { ConflictException, Injectable } from '@nestjs/common';
import { RecommenderOrchestrator } from './recommender-orchestrator.service';
import { Logger } from '@nestjs/common';
import { InternalServerErrorException } from '@nestjs/common';
import { ELogHandler } from 'src/common/enum/LogHandler.enum';
import { EWarnRecSystem } from 'src/common/enum/WarnHandler.enum';
import { EErrRecSystem } from 'src/common/enum/ErrHandler.enum';
import { ERestMessages, ERestStatus } from 'src/common/enum/Rest.enum';
import { StrategyRegistry } from './strategy-registry';

@Injectable()
export class RecommenderSystemService {
  private readonly logger = new Logger(RecommenderSystemService.name);
  private isGenerating = false;

  constructor(
    private readonly recommenderOrchestrator: RecommenderOrchestrator,
    private readonly strategyRegistry: StrategyRegistry,
  ) {}

  triggerGeneration() {
    if (this.isGenerating) {
      this.logger.warn(EWarnRecSystem.TRIGER_ALREADY_RUNNING);
      throw new ConflictException(ERestMessages.GENERATION_STILL_PROGRESS);
    }

    this.isGenerating = true;
    this.logger.log(ELogHandler.GENERATION_MANUAL_INITIALIZED);

    this.recommenderOrchestrator
      .runGeneration()
      .finally(() => {
        this.isGenerating = false;
        this.logger.log(ELogHandler.GENERATION_MANUAL_COMPLITE);
      })
      .catch((error) => {
        this.logger.error(EErrRecSystem.ERROR_DURING_GENERATION, error);
        this.isGenerating = false;
        throw new InternalServerErrorException(
          EErrRecSystem.ERROR_DURING_GENERATION,
        );
      });

    return {
      status: ERestStatus.ACCEPTED,
      message: ERestMessages.GENERATION_RUN_BACKGROUND,
    };
  }

  getGenerationStatus() {
    if (this.isGenerating) {
      return { message: 'Метод в процессе' };
    } else {
      return { message: 'Метод завершен' };
    }
  }

  getAllStrategys() {
    const personalStrategys = this.strategyRegistry.getAllPersonalStrategies();
    const globalStrategys = this.strategyRegistry.getAllGlobalStrategies();

    return {
      personal: personalStrategys,
      global: globalStrategys,
    };
  }
}
