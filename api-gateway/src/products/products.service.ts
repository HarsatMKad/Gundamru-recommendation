import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Product } from 'src/database/entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  async getRecomendetProductIds(): Promise<string[]> {
    const products = await this.productsRepository.find({
      select: ['id'],
      where: { is_published: true, price: Not(0), stock_quantity: Not(0) },
    });

    return products.map((product) => product.id);
  }
}
