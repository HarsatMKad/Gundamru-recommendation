import axios from 'axios';
import { Injectable } from '@nestjs/common';
import { RecommendationItem as RecItem } from './interface/recommendation.interface';
import { z } from 'zod';

@Injectable()
export class PythonEngineClient {
  private readonly baseUrl =
    process.env.PYTHON_ENGINE_URL || 'http://localhost:8000';

  private recItemSchema = z.object({
    sku: z.number(),
    score: z.number(),
  });

  private PythonResponseSchema = z.object({
    results: z.record(z.string(), z.array(this.recItemSchema)),
  });

  async fetchAllStrategyResults(
    strategies: string[],
    userIds: number[],
  ): Promise<Record<string, Record<number, RecItem[]>>> {
    const requests = strategies.map(async (strategy) => {
      try {
        const response = await axios.post(
          `${this.baseUrl}/calculate-strategy/${strategy}`,
          {
            user_ids: userIds,
          },
        );

        const validatedData = this.PythonResponseSchema.parse(response.data);

        const normalizedResults: Record<number, RecItem[]> = {};
        for (const [userId, items] of Object.entries(validatedData.results)) {
          normalizedResults[Number(userId)] = items;
        }

        return { strategy, data: normalizedResults };
      } catch (error) {
        console.error(`Ошибка при расчете стратегии ${strategy}: ${error}`);
        return { strategy, data: {} };
      }
    });

    const results = await Promise.all(requests);

    return results.reduce(
      (acc, current) => {
        acc[current.strategy] = current.data;
        return acc;
      },
      {} as Record<string, Record<number, RecItem[]>>,
    );
  }
}
