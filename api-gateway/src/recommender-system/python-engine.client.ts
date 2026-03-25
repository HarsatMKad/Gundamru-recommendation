import axios from 'axios';
import { Injectable } from '@nestjs/common';
import { RecommendationItem } from '../common/interface/recommendation.interface';
import {
  AVAILABLE_STRATEGIES,
  StrategyScope,
} from 'src/common/config/strategies.config';
import { z } from 'zod';
import { Logger } from '@nestjs/common';
import { WARN_REC_SYSTEM } from 'src/common/util/err-handler.util';
import { CALCULATION_ERROR } from 'src/common/util/err-handler.util';
import { ConfigService } from '@nestjs/config';
import {
  PythonPersonalResults,
  PythonGlobalResults,
} from '../common/interface/recommendation.interface';

@Injectable()
export class PythonEngineClient {
  private readonly pythonUrl: string;
  private readonly logger: Logger;

  constructor(private configService: ConfigService) {
    this.pythonUrl = this.configService.get<string>(
      'PYTHON_SERVICE_URL',
      'http://localhost:8000',
    );
    this.logger = new Logger(PythonEngineClient.name);
  }

  private recItemSchema = z.object({
    sku: z.number(),
    score: z.number(),
  });

  private PythonResponseSchema = z.object({
    results: z.record(z.string(), z.array(this.recItemSchema)),
  });

  async fetchPersonalStrategyResults(
    strategies: string[],
    userIds: number[],
  ): Promise<PythonPersonalResults> {
    const requests = strategies.map(async (strategyName) => {
      const strategyDef = AVAILABLE_STRATEGIES.find(
        (s) => s.name === strategyName,
      );

      if (!strategyDef || strategyDef.scope !== StrategyScope.PERSONAL) {
        this.logger.warn(
          `${WARN_REC_SYSTEM.NOT_STRATEGY_OR_SCOPE} for strategy: ${strategyName}`,
        );
        return { strategy: strategyName, data: {} };
      }

      try {
        const response = await axios.post(
          `${this.pythonUrl}${strategyDef.calculate_endpoint}`,
          {
            user_ids: userIds,
          },
        );

        const validatedData = this.PythonResponseSchema.parse(response.data);

        const normalizedResults: Record<number, RecommendationItem[]> = {};
        for (const [userId, items] of Object.entries(validatedData.results)) {
          normalizedResults[Number(userId)] = items;
        }

        return { strategy: strategyName, data: normalizedResults };
      } catch (error) {
        console.error(
          `${CALCULATION_ERROR} with strategy: ${strategyName}: ${error}`,
        );
        return { strategy: strategyName, data: {} };
      }
    });

    const results = await Promise.all(requests);

    return results.reduce(
      (acc, current) => {
        acc[current.strategy] = current.data;
        return acc;
      },
      {} as Record<string, Record<number, RecommendationItem[]>>,
    );
  }

  async fetchGlobalStrategyResults(
    strategies: string[],
  ): Promise<PythonGlobalResults> {
    const requests = strategies.map(async (strategyName) => {
      const strategyDef = AVAILABLE_STRATEGIES.find(
        (s) => s.name === strategyName,
      );

      if (!strategyDef || strategyDef.scope !== StrategyScope.GLOBAL) {
        this.logger.warn(
          `${WARN_REC_SYSTEM.NOT_STRATEGY_OR_SCOPE} for strategy: ${strategyName}`,
        );
        return { strategy: strategyName, data: [] };
      }

      try {
        const response = await axios.post(
          `${this.pythonUrl}${strategyDef.calculate_endpoint}`,
        );

        const validatedData = z.array(this.recItemSchema).parse(response.data);

        return { strategy: strategyName, data: validatedData };
      } catch (error) {
        console.error(
          `${CALCULATION_ERROR} with global strategy: ${strategyName}: ${error}`,
        );
        return { strategy: strategyName, data: [] };
      }
    });

    const results = await Promise.all(requests);

    return results.reduce(
      (acc, current) => {
        acc[current.strategy] = current.data;
        return acc;
      },
      {} as Record<string, RecommendationItem[]>,
    );
  }
}
