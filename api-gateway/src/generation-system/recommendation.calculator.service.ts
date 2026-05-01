import { Injectable, Logger } from '@nestjs/common';
import {
  TPersonalResults,
  TGlobalResults,
  TPythonResponse,
  TPersonalStrategyResult,
} from 'src/common/type/StrategyResult.type';
import { StrategyRegistry } from './strategy-registry';
import { UserEvent } from 'src/database/entities/user-event.entity';
import { performance } from 'perf_hooks';
import { IProductWithAttributes } from 'src/common/interface/entites.interface';
import { RecommendationSetting } from 'src/database/entities/recommendation-settings.entity';
import { IBaseRectrategy } from 'src/common/interface/strategies.interface';
import path from 'path';
import { spawn } from 'child_process';
import { IStrategyResultItem } from 'src/common/interface/recommendation.interface';
import { pythonConfig } from 'src/common/config/GenerateParams';
import { ConfigService } from 'node_modules/@nestjs/config';
import { IGenerationConfig } from 'src/common/interface/config.interface';
import { EConfigKey } from 'src/common/enum/ConfigKey.enum';

@Injectable()
export class RecommendationCalculatorService {
  private readonly logger = new Logger(RecommendationCalculatorService.name);
  constructor(
    private readonly strategyRegistry: StrategyRegistry,
    private readonly configService: ConfigService,
  ) {}

  async calculateRecommendationsStrategys(
    recLength: number,
    settings: RecommendationSetting[],
    userEvents: UserEvent[],
    products: IProductWithAttributes[],
  ): Promise<{
    personalResults: TPersonalResults | undefined;
    globalResults: TGlobalResults | undefined;
  }> {
    const personalStrategyNames = new Set<string>();
    const globalStrategyNames = new Set<string>();

    for (const strategy of settings) {
      strategy.personalMethods.forEach((method) =>
        personalStrategyNames.add(method.strategy),
      );
      if (strategy.fallbackStrategy) {
        globalStrategyNames.add(strategy.fallbackStrategy);
      }
    }

    const activePersonalStrategies =
      this.strategyRegistry.getPersonalStrategiesByNames([
        ...personalStrategyNames,
      ]);

    const activeGlobalStrategies =
      this.strategyRegistry.getGlobalStrategiesByNames([
        ...globalStrategyNames,
      ]);

    const allResults = await this.callPythonEngine(
      recLength,
      [...activePersonalStrategies, ...activeGlobalStrategies],
      userEvents,
      products,
    );

    const personalResults: TPersonalResults = {};
    const globalResults: TGlobalResults = {};

    for (const strategy of activePersonalStrategies) {
      const result = allResults[strategy.name];
      if (result) {
        personalResults[strategy.name] = result as TPersonalStrategyResult;
      }
    }

    for (const strategy of activeGlobalStrategies) {
      const result = allResults[strategy.name];
      if (result) {
        globalResults[strategy.name] = result as IStrategyResultItem[];
      }
    }

    return {
      personalResults: Object.keys(personalResults).length
        ? personalResults
        : undefined,
      globalResults: Object.keys(globalResults).length
        ? globalResults
        : undefined,
    };
  }

  private async spawnAsync(
    command: string,
    args: string[],
    payload: string,
  ): Promise<{ stdout: string; stderr: string }> {
    return new Promise((resolve, reject) => {
      const child = spawn(command, args);

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data: Buffer) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data: Buffer) => {
        stderr += data.toString();
      });

      child.stdin.write(payload);
      child.stdin.end();

      child.on('close', (code) => {
        if (code !== 0) {
          reject(
            new Error(`Python process exited with code ${code}: ${stderr}`),
          );
        } else {
          resolve({ stdout, stderr });
        }
      });

      child.on('error', (error) => {
        reject(error);
      });
    });
  }

  private async callPythonEngine(
    recLength: number,
    strategies: IBaseRectrategy[],
    userEvents: UserEvent[],
    products: IProductWithAttributes[],
  ): Promise<TPythonResponse> {
    const startTime = performance.now();
    const strategySlugs = strategies.map((s) => s.slug);

    const config = this.configService.get<IGenerationConfig>(
      EConfigKey.generation,
    );

    if (!config?.pythonPath) {
      this.logger.error('Path to python missing');
      return {};
    }

    const payload = {
      recLength: recLength,
      strategies: strategySlugs,
      events: userEvents.map((e) => ({
        userId: e.userId,
        productId: e.productId,
        weight: e.weight,
        count: e.count,
        timestamp: e.timestamp.getTime(),
        retentionDays: e.retentionDays,
      })),
      products: products.map((p) => ({
        id: p.id,
        brandId: p.brandId,
        grade: p.grade,
        scale: p.scale,
        price: p.price,
      })),
      config: config?.pythonConfig,
    };

    this.logger.debug(
      `Strategy calculation started for: ${strategySlugs.join(', ')}`,
    );

    try {
      const scriptPath = path.join(
        pythonConfig.PYTHON_BASE_PATH,
        pythonConfig.PYTHON_GATEWAY_NAME,
      );

      const { stdout, stderr } = await this.spawnAsync(
        config.pythonPath,
        [scriptPath],
        JSON.stringify(payload),
      );

      if (stderr) {
        this.logger.debug('Python stderr:', stderr);
      }

      const result = JSON.parse(stdout) as TPythonResponse;
      const endTime = performance.now();

      this.logger.debug(
        `All strategys calculation time: ${((endTime - startTime) / 1000).toFixed(3)} sec`,
      );

      return result;
    } catch (error) {
      this.logger.error('Error calling Python engine:', error);
      return {};
    }
  }
}
