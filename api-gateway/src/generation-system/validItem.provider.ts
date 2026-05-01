import { Inject, Injectable } from '@nestjs/common';
import * as entitesInterface from 'src/common/interface/entites.interface';

@Injectable()
export class ValidItemProvider {
  constructor(
    @Inject(entitesInterface.I_PRODUCTS_SERVICE)
    private readonly productService: entitesInterface.IProductService,
  ) {}

  async getValidProductsWithAttributes(): Promise<
    entitesInterface.IProductWithAttributes[]
  > {
    return await this.productService.getPublishedProductsWithAttributes();
  }
}
