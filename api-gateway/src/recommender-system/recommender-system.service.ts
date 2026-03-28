import { HttpStatus, Injectable } from '@nestjs/common';
import { RecommenderOrchestrator } from './recommender-orchestrator.service';
import { Logger } from '@nestjs/common';
import { InternalServerErrorException } from '@nestjs/common';
import { ELogHandler } from 'src/common/enum/LogHandler.enum';
import { EWarnRecSystem } from 'src/common/enum/WarnHandler.enum';
import { EErrRecSystem } from 'src/common/enum/ErrHandler.enum';
import { ERestMessages, ERestStatus } from 'src/common/enum/Rest.enum';

@Injectable()
export class RecommenderSystemService {
  private readonly logger = new Logger(RecommenderSystemService.name);
  private isGenerating = false;

  constructor(
    private readonly recommenderOrchestrator: RecommenderOrchestrator,
  ) {}

  triggerGenerationOrchestr(): {
    code: HttpStatus;
    status: string;
    message: string;
  } {
    this.logger.debug(`orchestr key: ${this.isGenerating}`);
    if (this.isGenerating) {
      this.logger.warn(EWarnRecSystem.TRIGER_ALREADY_RUNNING);
      return {
        code: HttpStatus.PROCESSING,
        status: ERestStatus.BUSY,
        message: ERestMessages.GENERATION_STILL_PROGRESS,
      };
    }

    this.isGenerating = true;
    this.logger.log(ELogHandler.GENERATION_MANUAL_INITIALIZED);
    try {
      void this.recommenderOrchestrator.handleCron().finally(() => {
        this.isGenerating = false;
        this.logger.log(ELogHandler.GENERATION_MANUAL_COMPLITE);
      });
      return {
        code: HttpStatus.ACCEPTED,
        status: ERestStatus.ACCEPTED,
        message: ERestMessages.GENERATION_RUN_BACKGROUND,
      };
    } catch (error) {
      this.logger.error(EErrRecSystem.ERROR_DURING_GENERATION, error);
      throw new InternalServerErrorException(
        EErrRecSystem.ERROR_DURING_GENERATION,
      );
    }
  }
}
