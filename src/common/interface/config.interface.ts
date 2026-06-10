export interface IDatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  name: string;
}

export interface ICacheConfig {
  ttl: number;
  max: number;
}

export interface ICronConfig {
  cleanupTime: string;
  generationTime: string;
}

export interface IServerConfig {
  port: number;
  apiKey: string;
  mainServerUrl: string;
  productApiKey: string;
}

interface IPythonConfig {
  minProductForUser: number;
  minSumularityThreshold: number;
  pricePercentageRande: number;
  priceCoefficient: number;
  interactionSensitivityCoefficient: number;
  maxDateWeight: number;
  minDateWeight: number;
  relevanceDays: number;
  weightCharacteristics: {
    brand: number;
    grade: number;
    scale: number;
    price: number;
  };
}

export interface IGenerationConfig {
  length: number;
  pythonPath: string;
  pythonConfig: IPythonConfig;
}

export interface IConfig {
  server: IServerConfig;
  database: IDatabaseConfig;
  cache: ICacheConfig;
  cron: ICronConfig;
  generation: IGenerationConfig;
}
