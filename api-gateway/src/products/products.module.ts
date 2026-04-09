import { Module } from '@nestjs/common';
import { ProductService } from './products.service';
import { Product } from 'src/database/entities/product.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductAttributes } from 'src/database/entities/product-attributes.entity';
import { I_PRODUCTS_SERVICE } from 'src/common/interface/entites.interface';

@Module({
  imports: [TypeOrmModule.forFeature([Product, ProductAttributes])],
  providers: [
    {
      provide: I_PRODUCTS_SERVICE,
      useClass: ProductService,
    },
  ],
  exports: [
    {
      provide: I_PRODUCTS_SERVICE,
      useClass: ProductService,
    },
  ],
})
export class ProductsModule {}
