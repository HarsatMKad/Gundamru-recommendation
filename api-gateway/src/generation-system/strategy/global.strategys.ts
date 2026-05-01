import { Injectable } from '@nestjs/common';
import { StrategyScope } from 'src/common/enum/StrategyScope.enum';
import { IGlobalStrategy } from 'src/common/interface/strategies.interface';

@Injectable()
export class GlobalPopularStrategy implements IGlobalStrategy {
  readonly name = 'Глобальная популярность';
  readonly slug = 'global_popylar';
  readonly description = `Глобально популярные товары. Рекомендует самые популярные товары за определенный период на основании активности взаимодействия с ними.`;
  readonly scope = StrategyScope.GLOBAL;
}
