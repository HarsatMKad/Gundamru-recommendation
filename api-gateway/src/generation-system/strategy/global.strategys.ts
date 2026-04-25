import { Injectable } from '@nestjs/common';
import { StrategyScope } from 'src/common/enum/StrategyScope.enum';
import { IGlobalStrategy } from 'src/common/interface/strategies.interface';

@Injectable()
export class GlobalPopularStrategy implements IGlobalStrategy {
  readonly name = 'global_popylar';
  readonly description = 'Самые популярные товары';
  readonly scope = StrategyScope.GLOBAL;
}
