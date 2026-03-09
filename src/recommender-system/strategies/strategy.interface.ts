export interface RecommendationStrategy {
  name: string;
  description: string;
  generate(
    userId: number,
    context: string,
  ): Promise<{ sku: number; score: number }[]>;
}
