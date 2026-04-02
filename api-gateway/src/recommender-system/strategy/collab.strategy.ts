import { IPersonalStrategy } from 'src/common/interface/strategies.interface';
import { TPersonalStrategyResult } from 'src/common/type/StrategyResult.type';
import { Injectable } from '@nestjs/common';
import { UserEvent } from 'src/database/entities/user-event.entity';
import { Logger } from '@nestjs/common';
import { Matrix } from 'ml-matrix';
import { StrategyScope } from 'src/common/enum/StrategyScope.enum';

@Injectable()
export class CollabStrategy implements IPersonalStrategy {
  readonly name = 'collab';
  readonly description = 'Коллаборативная фильтрация';
  readonly scope = StrategyScope.PERSONAL;
  private readonly logger = new Logger(CollabStrategy.name);

  calculate(
    userEvents: UserEvent[],
    recLength: number,
  ): TPersonalStrategyResult {
    const {
      matrix,
      userIds: allUserIds,
      productIds,
    } = this.buildRatingMatrix(userEvents);

    const userIds = [...new Set(userEvents.map((event) => event.user_id))];

    const normalizedMatrix = this.normalizeMatrix(matrix);

    const covarianceMatrix = this.calculateCovariance(normalizedMatrix);

    const results = this.generateRecommendationsFromMatrix(
      userIds,
      allUserIds,
      productIds,
      matrix,
      covarianceMatrix,
      recLength,
    );

    return results;
  }

  private buildRatingMatrix(userEvents: UserEvent[]): {
    matrix: Matrix;
    userIds: string[];
    productIds: string[];
  } {
    const userMap = new Map<string, number>();
    const productMap = new Map<string, number>();
    const ratings = new Map<string, Map<string, number>>();

    let userIndex = 0;
    let productIndex = 0;

    for (const event of userEvents) {
      const weight = event.eventType?.weight || 0;
      if (weight === 0) continue;

      if (!userMap.has(event.user_id)) {
        userMap.set(event.user_id, userIndex++);
      }

      if (!productMap.has(event.product_id)) {
        productMap.set(event.product_id, productIndex++);
      }

      if (!ratings.has(event.user_id)) {
        ratings.set(event.user_id, new Map());
      }

      const userRatings = ratings.get(event.user_id)!;
      const currentRating = userRatings.get(event.product_id) || 0;
      userRatings.set(event.product_id, currentRating + weight);
    }

    // Создаем матрицу
    const matrix = new Matrix(userMap.size, productMap.size);
    const userIds: string[] = new Array<string>(userMap.size);
    const productIds: string[] = new Array<string>(productMap.size);

    // Заполняем обратные индексы
    for (const [userId, idx] of userMap.entries()) {
      userIds[idx] = userId;
    }
    for (const [productId, idx] of productMap.entries()) {
      productIds[idx] = productId;
    }

    // Заполняем матрицу
    for (const [userId, userRatings] of ratings.entries()) {
      const userIdx = userMap.get(userId)!;
      if (userIdx === undefined) continue;
      for (const [productId, rating] of userRatings.entries()) {
        const productIdx = productMap.get(productId)!;
        if (productIdx === undefined) continue;
        matrix.set(userIdx, productIdx, rating);
      }
    }
    return { matrix, userIds, productIds };
  }

  private normalizeMatrix(matrix: Matrix): Matrix {
    const normalized = Matrix.zeros(matrix.rows, matrix.columns);

    for (let i = 0; i < matrix.rows; i++) {
      const row = matrix.getRow(i);
      const mean = row.reduce((a, b) => a + b, 0) / row.length;
      const std = Math.sqrt(
        row.map((v) => Math.pow(v - mean, 2)).reduce((a, b) => a + b, 0) /
          row.length,
      );

      for (let j = 0; j < matrix.columns; j++) {
        const value = matrix.get(i, j);
        normalized.set(i, j, std === 0 ? 0 : (value - mean) / std);
      }
    }

    return normalized;
  }

  private calculateCovariance(normalizedMatrix: Matrix): Matrix {
    // Covariance = (M^T * M) / (n-1)
    const n = normalizedMatrix.rows;
    const mt = normalizedMatrix.transpose();
    const covariance = mt.mmul(normalizedMatrix);
    covariance.div(n - 1);
    return covariance;
  }

  private generateRecommendationsFromMatrix(
    targetUserIds: string[],
    allUserIds: string[],
    productIds: string[],
    ratingMatrix: Matrix,
    covarianceMatrix: Matrix,
    recLength: number,
  ): TPersonalStrategyResult {
    const results: TPersonalStrategyResult = {};
    const userIdToIndex = new Map(allUserIds.map((id, idx) => [id, idx]));

    for (const userId of targetUserIds) {
      const userIdx = userIdToIndex.get(userId);
      if (userIdx === undefined) {
        results[userId] = [];
        continue;
      }

      const userRatings = ratingMatrix.getRow(userIdx);
      const purchasedProducts: number[] = [];

      for (let i = 0; i < userRatings.length; i++) {
        if (userRatings[i] > 0) {
          purchasedProducts.push(i);
        }
      }

      if (purchasedProducts.length === 0) {
        results[userId] = [];
        continue;
      }

      // Оценка непокупленных товаров
      const scores: Array<{ productId: string; score: number }> = [];

      for (let productIdx = 0; productIdx < productIds.length; productIdx++) {
        if (userRatings[productIdx] > 0) continue;

        let totalScore = 0;
        let totalSimilarity = 0;

        for (const purchasedIdx of purchasedProducts) {
          const similarity = covarianceMatrix.get(purchasedIdx, productIdx);
          if (similarity > 0) {
            totalScore += userRatings[purchasedIdx] * similarity;
            totalSimilarity += Math.abs(similarity);
          }
        }

        if (totalSimilarity > 0) {
          scores.push({
            productId: productIds[productIdx],
            score: totalScore / totalSimilarity,
          });
        }
      }

      results[userId] = scores
        .sort((a, b) => b.score - a.score)
        .slice(0, recLength)
        .map(({ productId, score }) => ({ sku: productId, score }));
    }

    return results;
  }
}
