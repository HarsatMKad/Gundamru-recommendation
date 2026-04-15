import { IStrategyResultItem } from '../interface/recommendation.interface';

export type TPersonalStrategyResult = Record<string, IStrategyResultItem[]>;

export type TPersonalResults = Record<string, TPersonalStrategyResult>;

export type TGlobalResults = Record<string, IStrategyResultItem[]>;

export type TStrategyResult = TPersonalResults | TGlobalResults;

export type TStrategyCalculateResult =
  | TPersonalStrategyResult
  | IStrategyResultItem[];

export type TPythonResponse = Record<string, TPythonResult>;

export type TPythonResult = TPersonalStrategyResult | IStrategyResultItem[];
