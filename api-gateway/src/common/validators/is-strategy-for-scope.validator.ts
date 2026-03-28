import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import {
  AVAILABLE_STRATEGIES,
  StrategyScope,
} from '../interface/strategies.interface';

@ValidatorConstraint({ name: 'isStrategyForScope', async: false })
export class IsStrategyForScope implements ValidatorConstraintInterface {
  validate(strategyName: string, args: ValidationArguments) {
    const requiredScope = args.constraints[0] as StrategyScope;
    const strategy = AVAILABLE_STRATEGIES.find((s) => s.name === strategyName);
    if (!strategy) return false;
    return strategy.scope === requiredScope;
  }

  defaultMessage(args: ValidationArguments) {
    return `Стратегия ${args.value} соответствует типу: ${args.constraints[0]}`;
  }
}
