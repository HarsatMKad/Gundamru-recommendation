import { Injectable } from '@nestjs/common';
import { RecommendationStrategy } from './strategy.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from 'src/products/entities/product.entity';

@Injectable()
export class CollabStrategy implements RecommendationStrategy {
  name = 'collab';
  description = 'Collaborative Filtering Recommendations.';
  constructor(
    @InjectRepository(Product) private productRepo: Repository<Product>,
  ) {}

  async generate(userId: number, context: string) {
    console.log(
      'Стретегия Collab. Начата генерация для: ',
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
