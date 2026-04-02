import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { StrategyScope } from 'src/common/enum/StrategyScope.enum';
import { Injectable } from '@nestjs/common';
import { StrategyRegistry } from 'src/recommender-system/strategy-registry';

@Injectable()
@ValidatorConstraint({ name: 'isStrategyForScope', async: false })
export class IsStrategyForScope implements ValidatorConstraintInterface {
  constructor(private readonly strategyRegistry: StrategyRegistry) {}

  validate(strategyName: string, args: ValidationArguments) {
    const requiredScope = args.constraints[0] as StrategyScope;
    const strategy =
      this.strategyRegistry.getPersonalStrategy(strategyName) ||
      this.strategyRegistry.getGlobalStrategy(strategyName);

    if (!strategy) return false;
    return strategy.scope === requiredScope;
  }

  defaultMessage(args: ValidationArguments) {
    return `Стратегия ${args.value} не найдена в активных ${args.constraints[0]} стратегиях.`;
  }
}
