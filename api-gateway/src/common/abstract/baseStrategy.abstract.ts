import path from 'path';
import { StrategyScope } from '../enum/StrategyScope.enum';
import { IBaseRectrategy } from '../interface/strategies.interface';
import { TStrategyResult } from '../type/StrategyResult.type';
import { UserEvent } from 'src/database/entities/user-event.entity';
import { spawnSync } from 'child_process';

export abstract class BaseGenerateStrategy<
  T extends TStrategyResult,
> implements IBaseRectrategy {
  abstract readonly name: string;
  abstract readonly description: string;
  abstract readonly scope: StrategyScope;
  protected abstract readonly scriptName: string;

  private readonly pythonPath = '/opt/venv/bin/python';
  private readonly pythonBasePath =
    '/app/src/recommender-system/strategy/python';

  protected getPythonScriptPath(): string {
    return path.join(this.pythonBasePath, this.scriptName);
  }

  calculate(userEvents: UserEvent[], recLength: number): T {
    const payload = {
      events: userEvents.map((e) => ({
        user_id: e.user_id,
        product_id: e.product_id,
        weight: e.eventType.weight,
        count: e.count,
        timestamp: e.timestamp.getTime(),
        retention_days: e.eventType.retention_days,
      })),
      rec_length: recLength,
    };

    const pythonProcess = spawnSync(
      this.pythonPath,
      [this.getPythonScriptPath()],
      {
        input: JSON.stringify(payload),
        encoding: 'utf-8',
        maxBuffer: 1024 * 1024 * 10,
      },
    );

    if (pythonProcess.stderr) {
      console.error('Python stderr:', pythonProcess.stderr.toString());
    }

    if (pythonProcess.error) {
      throw new Error(`Python error: ${pythonProcess.error.message}`);
    }

    try {
      const pythonResult = JSON.parse(pythonProcess.stdout) as T;
      return pythonResult;
    } catch (error) {
      console.error(`Python output: ${pythonProcess.stderr}: ${error}`);
      throw new Error('Failed to parse Python output');
    }
  }
}
