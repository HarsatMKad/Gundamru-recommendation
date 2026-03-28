export default () => ({
  server: {
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
    internalApiKey: process.env.INTERNAL_API_KEY ?? 'secret_api_key',
  },
  database: {
    host: process.env.DB_HOST ?? '',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
    username: process.env.DB_USERNAME ?? '',
    password: process.env.DB_PASSWORD ?? '',
    name: process.env.DB_DATABASE_NAME ?? '',
  },
  cache: {
    ttl: process.env.CACHE_TTL ? parseInt(process.env.CACHE_TTL, 10) : 600,
    max: process.env.CACHE_MAX ? parseInt(process.env.CACHE_MAX, 10) : 2000,
  },
  cron: {
    cleanupTime: process.env.CRON_CLEANUP_TIME ?? '0 3 * * *',
    generationTime: process.env.CRON_GENERATION_TIME ?? '0 4 * * *',
  },
  generation: {
    length: process.env.REC_GENERATION_LENTGH
      ? parseInt(process.env.REC_GENERATION_LENTGH, 10)
      : 10,
  },
});
