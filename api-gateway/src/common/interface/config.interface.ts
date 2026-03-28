export interface IDatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  name: string;
}

export interface ICacheConfig {
  ttl: string;
  max: number;
}

export interface ICronConfig {
  cleanupTime: string;
  generationTime: string;
}

export interface IServerConfig {
  port: number;
  internalApiKey: string;
}

export interface IGenerationConfig {
  length: number;
}

export interface IConfig {
  server: IServerConfig;
  database: IDatabaseConfig;
  cache: ICacheConfig;
  cron: ICronConfig;
  generation: IGenerationConfig;
}
