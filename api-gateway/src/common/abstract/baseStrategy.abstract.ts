import path from 'path';
import { StrategyScope } from '../enum/StrategyScope.enum';
import { IBaseRectrategy, Ipayload } from '../interface/strategies.interface';
import { TStrategyCalculateResult } from '../type/StrategyResult.type';
import { UserEvent } from 'src/database/entities/user-event.entity';
import { spawnSync } from 'child_process';
import { IProductWithAttributes } from '../interface/entites.interface';
import fs from 'fs';

export abstract class BaseGenerateStrategy<
  T extends TStrategyCalculateResult,
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

  getScope(): string {
    return this.scope;
  }

  abstract getPayload(
    recLength: number,
    userEvents?: UserEvent[],
    products?: IProductWithAttributes[],
  ): Ipayload | undefined;

  calculate(
    recLength: number,
    userEvents?: UserEvent[],
    products?: IProductWithAttributes[],
  ): T {
    const payload = this.getPayload(recLength, userEvents, products);

    if (payload === undefined) {
      throw new Error('No data to generate.');
    }

    const scriptPath = this.getPythonScriptPath();
    if (!fs.existsSync(scriptPath)) {
      throw new Error('Python script not found.');
    }

    const pythonProcess = spawnSync(this.pythonPath, [scriptPath], {
      input: JSON.stringify(payload),
      encoding: 'utf-8',
      maxBuffer: 1024 * 1024 * 10,
    });

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
