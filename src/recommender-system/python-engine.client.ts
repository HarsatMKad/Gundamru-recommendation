import axios from 'axios';
import { Injectable } from '@nestjs/common';
import { RecommendationItem as RecItem } from './interface/recommendation.interface';
import { z } from 'zod';

@Injectable()
export class PythonEngineClient {
  private readonly baseUrl = 'http://localhost:8000';

  private recItemSchema = z.object({
    sku: z.number(),
    score: z.number(),
  });

  private PythonResponseSchema = z.object({
    results: z.record(z.string(), z.array(this.recItemSchema)),
  });

  // заглушка
  fetchAllStrategyResults(
    strategies: string[],
    userIds: number[],
  ): Record<string, Record<number, RecItem[]>> {
    console.log('🔧 Используется заглушка PythonClient');

    const result: Record<string, Record<number, RecItem[]>> = {};

    for (const strategy of strategies) {
      result[strategy] = {};

      for (const userId of userIds) {
        const items: RecItem[] = [1, 2, 3, 4, 5].map((index) => ({
          sku: index,
          score: 1 / index,
        }));

        result[strategy][userId] = items;
      }
    }

    return result;
  }

  // тестовый вариант
  async fetchAllStrategyResults2(
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
