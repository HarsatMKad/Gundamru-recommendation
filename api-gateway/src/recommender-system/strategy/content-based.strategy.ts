import { Injectable } from '@nestjs/common';
import { StrategyScope } from 'src/common/enum/StrategyScope.enum';
import { TPersonalStrategyResult } from 'src/common/type/StrategyResult.type';
import { BaseGenerateStrategy } from 'src/common/abstract/baseStrategy.abstract';
import { UserEvent } from 'src/database/entities/user-event.entity';
import { Ipayload } from 'src/common/interface/strategies.interface';
import { IProductWithAttributes } from 'src/common/interface/entites.interface';

@Injectable()
export class ContentBasedStrategy extends BaseGenerateStrategy<TPersonalStrategyResult> {
  readonly name = 'content-based';
  readonly description = 'Подбор на основании характеристик товаров';
  readonly scope = StrategyScope.PERSONAL;
  protected readonly scriptName = 'content-based.strategy.py';

  getPayload(
    recLength: number,
    userEvents?: UserEvent[],
    products?: IProductWithAttributes[],
  ): Ipayload {
    if (userEvents && products) {
      const productsWithoutPrice = products.filter(
        (p) => p.price === undefined || p.price === null,
      );

      if (productsWithoutPrice.length > 0) {
        console.warn(`Продуктов без цены: ${productsWithoutPrice.length}`);
      }

      return {
        events: userEvents.map((e) => ({
          user_id: e.user_id,
          product_id: e.product_id,
          weight: e.weight,
          count: e.count,
          timestamp: e.timestamp.getTime(),
          retention_days: e.retentionDays,
        })),
        products: products.map((p) => ({
          id: p.id,
          brand_id: p.brand_id,
          grade: p.grade,
          scale: p.scale,
          price: p.price,
        })),
        rec_length: recLength,
      };
    } else {
      return {
        rec_length: recLength,
      };
    }
  }
}
