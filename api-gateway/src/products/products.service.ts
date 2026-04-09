import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from 'src/database/entities/product.entity';
import {
  IProductService,
  IProductWithAttributes,
} from 'src/common/interface/entites.interface';
import { ProductAttributes } from 'src/database/entities/product-attributes.entity';

@Injectable()
export class ProductService implements IProductService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  async getPublishedProductsWithAttributes(): Promise<
    IProductWithAttributes[]
  > {
    const results = await this.productsRepository
      .createQueryBuilder('product')
      .innerJoin(
        ProductAttributes,
        'attributes',
        'product.id = attributes.product_id',
      )
      .where('product.is_published = :isPublished', { isPublished: true })
      .andWhere('product.price > :price', { price: 0 })
      .andWhere('product.stock_quantity > :stockQuantity', {
        stockQuantity: 0,
      })
      .select([
        'product.id AS id',
        'product.brand_id AS brand_id',
        'attributes.grade AS grade',
        'attributes.scale AS scale',
      ])
      .getRawMany<IProductWithAttributes>();
    return results;
  }
}
