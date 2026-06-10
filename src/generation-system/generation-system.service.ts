import { ConflictException, Injectable } from '@nestjs/common';
import { RecommenderOrchestrator } from './orchestrator.service';
import { Logger } from '@nestjs/common';
import { InternalServerErrorException } from '@nestjs/common';
import { ELogHandler } from 'src/common/enum/LogHandler.enum';
import { EWarnRecSystem } from 'src/common/enum/WarnHandler.enum';
import { EErrorHandler } from 'src/common/enum/ErrHandler.enum';
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
        this.logger.error(EErrorHandler.ERROR_DURING_GENERATION, error);
        this.isGenerating = false;
        throw new InternalServerErrorException(
          EErrorHandler.ERROR_DURING_GENERATION,
        );
      });

    return {
      status: ERestStatus.ACCEPTED,
      message: ERestMessages.GENERATION_RUN_BACKGROUND,
    };
  }

  getGenerationStatus() {
    if (this.isGenerating) {
      return { generation_ready: false, message: 'Процесс генерации занят' };
    } else {
      return {
        generation_ready: true,
        message: 'Процесс генерации свободен',
      };
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
