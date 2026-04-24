import { Injectable } from '@nestjs/common';
import {
  IProductService,
  IProductWithAttributes,
} from 'src/common/interface/entites.interface';
import axios from 'axios';
import { EErrorHandler } from 'src/common/enum/ErrHandler.enum';

interface ApiResponse {
  data: {
    items: Array<{
      id: string;
      brand: { id: string };
      price: number;
      attributes: {
        grade: string;
        scale: string;
      };
    }>;
  };
}

@Injectable()
export class ProductService implements IProductService {
  async getPublishedProductsWithAttributes(): Promise<
    IProductWithAttributes[]
  > {
    const apiKey = 'FNuVEMDhPId7BiU2vHIf5aB3m9o3UW2EKF70GPJGiXTOGwBxZ6';
    const baseUrl = 'https://gundam.ru/api/v1/catalog/products';

    try {
      const response = await axios.get<ApiResponse>(baseUrl, {
        params: {
          limit: 20000,
          offset: 0,
        },
        headers: {
          'x-api-key': apiKey,
        },
      });

      const products: IProductWithAttributes[] = response.data.data.items.map(
        (item) => ({
          id: item.id,
          brand_id: item.brand.id,
          grade: item.attributes.grade,
          scale: item.attributes.scale,
          price: item.price,
        }),
      );

      return products;
    } catch (error) {
      console.error(`${EErrorHandler.ERROR_FETCHING}: ${error}`);
      throw error;
    }
  }
}
