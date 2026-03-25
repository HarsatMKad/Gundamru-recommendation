import { HttpStatus, Injectable } from '@nestjs/common';
import { RecommenderOrchestrator } from './recommender-orchestrator.service';
import { Logger } from '@nestjs/common';
import { InternalServerErrorException } from '@nestjs/common';
import { LOG_HANDLER } from 'src/common/util/log-handler.util';
import {
  WARN_REC_SYSTEM,
  ERR_REC_SYSTEM,
} from 'src/common/util/err-handler.util';
import {
  REST_MESSAGES,
  REST_STATUS,
} from 'src/common/util/rest-message-handler.util';

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
    this.logger.log(`orchestr key: ${this.isGenerating}`);
    if (this.isGenerating) {
      this.logger.warn(WARN_REC_SYSTEM.TRIGER_ALREADY_RUNNING);
      return {
        code: HttpStatus.PROCESSING,
        status: REST_STATUS.BUSY,
        message: REST_MESSAGES.GENERATION_STILL_PROGRESS,
      };
    }

    this.isGenerating = true;
    this.logger.log(LOG_HANDLER.GENERATION_MANUAL_INITIALIZED);
    try {
      void this.recommenderOrchestrator.handleCron().finally(() => {
        this.isGenerating = false;
        this.logger.log(LOG_HANDLER.GENERATION_MANUAL_COMPLITE);
      });
      return {
        code: HttpStatus.OK,
        status: REST_STATUS.SUCCESS,
        message: REST_MESSAGES.GENERATION_RUN_BACKGROUND,
      };
    } catch (error) {
      this.logger.error(ERR_REC_SYSTEM.ERROR_DURING_GENERATION, error);
      throw new InternalServerErrorException(
        ERR_REC_SYSTEM.ERROR_DURING_GENERATION,
      );
    }
  }
}
