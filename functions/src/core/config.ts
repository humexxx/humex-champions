export const runtime = {
  region: 'us-central1' as const,
  memoryMiB: 512 as const,
  timeoutSeconds: 60 as const,
  maxInstances: 10 as const,
};

export const schedulerRuntime = {
  ...runtime,
  timeoutSeconds: 300 as const,
  memoryMiB: 1024 as const,
};

export const env = {
  POLYGON_API_KEY: process.env.POLYGON_API_KEY ?? '',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? '',
  F1_API_KEY: process.env.F1_API_KEY ?? '',
  SPORTS_DB_API_KEY: process.env.SPORTS_DB_API_KEY ?? '',
  NODE_ENV: process.env.NODE_ENV ?? 'development',
};

export const flags = {
  enableVendors: process.env.NODE_ENV !== 'development',
  enableCache: true,
  enableRateLimit: true,
};
