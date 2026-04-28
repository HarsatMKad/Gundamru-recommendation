import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  IProductService,
  IProductWithAttributes,
} from 'src/common/interface/entites.interface';
import axios from 'axios';
import { EErrorHandler } from 'src/common/enum/ErrHandler.enum';
import { IServerConfig } from 'src/common/interface/config.interface';
import { ConfigService } from 'node_modules/@nestjs/config';
import { EConfigKey } from 'src/common/enum/ConfigKey.enum';

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
      isRecomended: boolean;
    }>;
  };
}

@Injectable()
export class ProductService implements IProductService {
  private readonly mainServerUrl?: string;
  private readonly productApiKey?: string;

  constructor(private configService: ConfigService) {
    this.mainServerUrl = this.configService.get<IServerConfig>(
      EConfigKey.server,
    )?.mainServerUrl;

    this.productApiKey = this.configService.get<IServerConfig>(
      EConfigKey.server,
    )?.productApiKey;
  }

  async getPublishedProductsWithAttributes(): Promise<
    IProductWithAttributes[]
  > {
    if (!this.mainServerUrl || !this.productApiKey) {
      throw new InternalServerErrorException(
        'main_server_url or product_api_key is not defined',
      );
    }

    const catalogProductRequest = `${this.mainServerUrl}/api/v1/catalog/products`;

    try {
      const response = await axios.get<ApiResponse>(catalogProductRequest, {
        params: {
          limit: 20000,
          offset: 0,
        },
        headers: {
          'x-api-key': this.productApiKey,
        },
      });

      const products: IProductWithAttributes[] = response.data.data.items.map(
        (item) => ({
          id: item.id,
          brand_id: item.brand.id,
          grade: item.attributes.grade,
          scale: item.attributes.scale,
          price: item.price,
          isRecomended: item.isRecomended,
        }),
      );

      return products;
    } catch (error) {
      console.error(`${EErrorHandler.ERROR_FETCHING}: ${error}`);
      throw error;
    }
  }
}
