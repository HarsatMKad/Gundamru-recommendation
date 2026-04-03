import { Injectable } from '@nestjs/common';
import { StrategyScope } from 'src/common/enum/StrategyScope.enum';
import { IPersonalStrategy } from 'src/common/interface/strategies.interface';
import { TPersonalStrategyResult } from 'src/common/type/StrategyResult.type';
import { UserEvent } from 'src/database/entities/user-event.entity';
import { spawnSync } from 'child_process';

@Injectable()
export class ItemBasedCollabStrategyPython implements IPersonalStrategy {
  readonly name = 'collab_item-based_python';
  readonly description = 'Коллаборативная фильтрация item-based python';
  readonly scope = StrategyScope.PERSONAL;
  private readonly pythonPath = '/opt/venv/bin/python';
  private readonly pythonScriptPath =
    '/app/src/recommender-system/strategy/python/collab.item-based.strategy.py';

  calculate(
    userEvents: UserEvent[],
    recLength: number,
  ): TPersonalStrategyResult {
    const payload = {
      events: userEvents.map((e) => ({
        user_id: e.user_id,
        product_id: e.product_id,
        weight: e.eventType.weight,
      })),
      recLength: recLength,
    };

    const pythonProcess = spawnSync(this.pythonPath, [this.pythonScriptPath], {
      input: JSON.stringify(payload),
      encoding: 'utf-8',
      maxBuffer: 1024 * 1024 * 50,
    });

    if (pythonProcess.stderr) {
      console.error('Python stderr:', pythonProcess.stderr.toString());
    }

    if (pythonProcess.error) {
      throw new Error(`Python error: ${pythonProcess.error.message}`);
    }

    try {
      const pythonResult = JSON.parse(
        pythonProcess.stdout,
      ) as TPersonalStrategyResult;

      return pythonResult;
    } catch (error) {
      console.error(`Python output: ${pythonProcess.stderr}: ${error}`);
      throw new Error('Failed to parse Python output');
    }
  }
}
