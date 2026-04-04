import { IPersonalStrategy } from 'src/common/interface/strategies.interface';
import { TPersonalStrategyResult } from 'src/common/type/StrategyResult.type';
import { Injectable } from '@nestjs/common';
import { UserEvent } from 'src/database/entities/user-event.entity';
import { Matrix } from 'ml-matrix';
import { StrategyScope } from 'src/common/enum/StrategyScope.enum';

@Injectable()
export class ItemBasedCollabStrategy implements IPersonalStrategy {
  readonly name = 'collab_item-based';
  readonly description = 'Коллаборативная фильтрация item-based (классическая)';
  readonly scope = StrategyScope.PERSONAL;

  readonly MIN_SIMILARITY_THRESHOLD = 0.01;

  calculate(
    userEvents: UserEvent[],
    recLength: number,
  ): TPersonalStrategyResult {
    const { matrix, userIds, productIds } =
      this.buildInteractionMatrix(userEvents);

    const { centeredMatrix, userMeans } = this.centerMatrixByRow(matrix);

    const itemUserMatrix = centeredMatrix.transpose();
    const itemSimilarityMatrix = this.calculateItemSimilarity(
      itemUserMatrix,
      this.MIN_SIMILARITY_THRESHOLD,
    );

    const results: TPersonalStrategyResult = {};

    for (let userIdx = 0; userIdx < userIds.length; userIdx++) {
      const userId = userIds[userIdx];
      const userInteractions = matrix.getRow(userIdx);
      const userCenteredInteractions = centeredMatrix.getRow(userIdx);
      const userMean = userMeans[userIdx];

      const interactedProductIndices: number[] = [];
      for (let i = 0; i < productIds.length; i++) {
        if (userInteractions[i] > 0) {
          interactedProductIndices.push(i);
        }
      }

      if (interactedProductIndices.length === 0) {
        results[userId] = [];
        continue;
      }

      const scores: { productIdIndex: number; score: number }[] = [];

      for (let productIdx = 0; productIdx < productIds.length; productIdx++) {
        if (userInteractions[productIdx] > 0) {
          continue;
        }

        let weightedScoreSum = 0;
        let similaritySum = 0;

        for (let i = 0; i < interactedProductIndices.length; i++) {
          const interactedProductIdx = interactedProductIndices[i];
          const similarity = itemSimilarityMatrix.get(
            productIdx,
            interactedProductIdx,
          );

          if (similarity > 0) {
            weightedScoreSum +=
              similarity * userCenteredInteractions[interactedProductIdx];
            similaritySum += similarity;
          }
        }

        if (similaritySum > 0) {
          const centeredPrediction = weightedScoreSum / similaritySum;
          const prediction = userMean + centeredPrediction;

          scores.push({
            productIdIndex: productIdx,
            score: prediction,
          });
        }
      }

      results[userId] = scores
        .sort((a, b) => b.score - a.score)
        .slice(0, recLength)
        .map(({ productIdIndex, score }) => ({
          sku: productIds[productIdIndex],
          score: score,
        }));
    }

    return results;
  }

  private buildInteractionMatrix(userEvents: UserEvent[]) {
    const userIdToIndex: { [key: string]: number } = {};
    const productIdToIndex: { [key: string]: number } = {};
    const ratings: { [key: string]: { [key: string]: number } } = {};

    let userCount = 0;
    let productCount = 0;

    for (let i = 0; i < userEvents.length; i++) {
      const event = userEvents[i];
      const weight = event.eventType.weight > 0 ? event.eventType.weight : 0;
      if (weight <= 0) continue;

      if (!(event.user_id in userIdToIndex)) {
        userIdToIndex[event.user_id] = userCount++;
      }

      if (!(event.product_id in productIdToIndex)) {
        productIdToIndex[event.product_id] = productCount++;
      }

      const currentUserId = event.user_id;
      const currentProductId = event.product_id;

      if (!ratings[currentUserId]) {
        ratings[currentUserId] = {};
      }

      ratings[currentUserId][currentProductId] =
        (ratings[currentUserId][currentProductId] || 0) + weight;
    }

    const matrix = Matrix.zeros(userCount, productCount);
    const userIds: string[] = Array.from({ length: userCount });
    for (const userId in userIdToIndex) {
      userIds[userIdToIndex[userId]] = userId;
    }

    const productIds: string[] = Array.from({ length: productCount });
    for (const productId in productIdToIndex) {
      productIds[productIdToIndex[productId]] = productId;
    }

    for (const userId in ratings) {
      const userIdx = userIdToIndex[userId];
      for (const productId in ratings[userId]) {
        const productIdx = productIdToIndex[productId];
        matrix.set(userIdx, productIdx, ratings[userId][productId]);
      }
    }

    return { matrix, userIds, productIds };
  }

  private centerMatrixByRow(matrix: Matrix): {
    centeredMatrix: Matrix;
    userMeans: number[];
  } {
    const centeredMatrix = Matrix.zeros(matrix.rows, matrix.columns);
    const userMeans: number[] = Array.from({ length: matrix.rows });

    for (let i = 0; i < matrix.rows; i++) {
      const row = matrix.getRow(i);
      let sum = 0;
      let count = 0;
      for (let j = 0; j < row.length; j++) {
        if (row[j] > 0) {
          sum += row[j];
          count++;
        }
      }

      const mean = count > 0 ? sum / count : 0;
      userMeans[i] = mean;

      for (let j = 0; j < matrix.columns; j++) {
        const value = matrix.get(i, j);
        if (value > 0) {
          centeredMatrix.set(i, j, value - mean);
        } else {
          centeredMatrix.set(i, j, 0);
        }
      }
    }

    return { centeredMatrix, userMeans };
  }

  private calculateItemSimilarity(
    itemUserMatrix: Matrix,
    minSimilarityThreshold: number,
  ): Matrix {
    const similarityMatrix = Matrix.zeros(
      itemUserMatrix.rows,
      itemUserMatrix.rows,
    );

    const rows: number[][] = [];
    for (let i = 0; i < itemUserMatrix.rows; i++) {
      rows.push(itemUserMatrix.getRow(i));
    }

    for (let i = 0; i < itemUserMatrix.rows; i++) {
      const vectorI = rows[i];
      for (let j = i; j < itemUserMatrix.rows; j++) {
        if (i === j) {
          similarityMatrix.set(i, j, 1.0);
          continue;
        }

        const vectorJ = rows[j];

        let dotProduct = 0;
        let normI = 0;
        let normJ = 0;

        for (let k = 0; k < vectorI.length; k++) {
          dotProduct += vectorI[k] * vectorJ[k];
          normI += vectorI[k] * vectorI[k];
          normJ += vectorJ[k] * vectorJ[k];
        }

        normI = Math.sqrt(normI);
        normJ = Math.sqrt(normJ);

        let similarity = 0;
        if (normI > 0 && normJ > 0) {
          similarity = dotProduct / (normI * normJ);
        }

        if (similarity > minSimilarityThreshold) {
          similarityMatrix.set(i, j, similarity);
          similarityMatrix.set(j, i, similarity);
        }
      }
    }

    return similarityMatrix;
  }
}
