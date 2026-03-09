import { Injectable } from '@nestjs/common';
import { RecommendationStrategy } from './strategy.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from 'src/products/entities/product.entity';

@Injectable()
export class PopularStrategy implements RecommendationStrategy {
  name = 'popular';
  description = 'Popular Filtering Recommendations.';
  constructor(
    @InjectRepository(Product) private productRepo: Repository<Product>,
  ) {}

  async generate(userId: number, context: string) {
    console.log(
      'Стретегия Popular. Начата генерация для: ',
      userId,
      ' в контексте: ',
      context,
    );
    const allProducts = await this.productRepo.find({ take: 5 });

    return allProducts.map((p) => ({
      sku: p.id,
      score: p.id * 0.1, // Тестовая математика
    }));
  }
}
