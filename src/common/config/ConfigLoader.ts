export default () => ({
  server: {
    port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
    apiKey: process.env.API_KEY ?? 'secret_api_key',
    mainServerUrl: process.env.MAIN_SERVER_URL ?? 'https://gundam.ru',
    productApiKey:
      process.env.PRODUCT_API_KEY ??
      'FNuVEMDhPId7BiU2vHIf5aB3m9o3UW2EKF70GPJGiXTOGwBxZ6',
  },
  database: {
    host: process.env.DB_HOST ?? '',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
    username: process.env.DB_USERNAME ?? '',
    password: process.env.DB_PASSWORD ?? '',
    name: process.env.DB_DATABASE_NAME ?? '',
  },
  cache: {
    ttl: process.env.CACHE_TTL ? parseInt(process.env.CACHE_TTL) : 600,
    max: process.env.CACHE_MAX ? parseInt(process.env.CACHE_MAX) : 2000,
  },
  cron: {
    cleanupTime: process.env.CRON_CLEANUP_TIME ?? '0 3 * * *',
    generationTime: process.env.CRON_GENERATION_TIME ?? '0 4 * * *',
  },
  generation: {
    length: process.env.REC_GENERATION_LENTGH
      ? parseInt(process.env.REC_GENERATION_LENTGH)
      : 10,
    pythonPath: process.env.PYTHON_PATH ?? '/opt/venv/bin/python',
    pythonConfig: {
      minProductForUser: process.env.MIN_PRODUCT_FOR_USER
        ? parseInt(process.env.MIN_PRODUCT_FOR_USER)
        : 10,
      minSumularityThreshold: process.env.MIN_SIMILARITY_THRESHOLD
        ? parseFloat(process.env.MIN_SIMILARITY_THRESHOLD)
        : 0.001,
      pricePercentageRande: process.env.PRICE_PERCENTAGE_RANGE
        ? parseFloat(process.env.PRICE_PERCENTAGE_RANGE)
        : 0.25,
      priceCoefficient: process.env.PRICE_COEFFICIENT
        ? parseFloat(process.env.PRICE_COEFFICIENT)
        : 1.3,
      interactionSensitivityCoefficient: process.env
        .INTERACTION_SENSITIVITY_COEFFICIENT
        ? parseFloat(process.env.INTERACTION_SENSITIVITY_COEFFICIENT)
        : 0.05,
      maxDateWeight: process.env.MAX_DATE_WEIGHT
        ? parseFloat(process.env.MAX_DATE_WEIGHT)
        : 1.0,
      minDateWeight: process.env.MIN_DATE_WEIGHT
        ? parseFloat(process.env.MIN_DATE_WEIGHT)
        : 0.6,
      relevanceDays: process.env.RELEVANCE_DAYS
        ? parseInt(process.env.RELEVANCE_DAYS)
        : 7,
      weightCharacteristics: {
        brand: process.env.CONTENT_BASED_WEIGHTS_BRAND
          ? parseFloat(process.env.CONTENT_BASED_WEIGHTS_BRAND)
          : 0.1,
        grade: process.env.CONTENT_BASED_WEIGHTS_GRADE
          ? parseFloat(process.env.CONTENT_BASED_WEIGHTS_GRADE)
          : 0.2,
        scale: process.env.CONTENT_BASED_WEIGHTS_SCALE
          ? parseFloat(process.env.CONTENT_BASED_WEIGHTS_SCALE)
          : 0.4,
        price: process.env.CONTENT_BASED_WEIGHTS_PRICE
          ? parseFloat(process.env.CONTENT_BASED_WEIGHTS_PRICE)
          : 0.3,
      },
    },
  },
});
