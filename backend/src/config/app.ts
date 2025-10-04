/**
 * Application configuration with environment validation
 */
export interface AppConfig {
  port: number;
  nodeEnv: 'development' | 'production' | 'test';
  cors: {
    origin: string[];
    credentials: boolean;
  };
  rateLimit: {
    windowMs: number;
    max: number;
  };
  api: {
    prefix: string;
    version: string;
  };
  logging: {
    level: 'error' | 'warn' | 'info' | 'debug';
    format: 'json' | 'simple';
  };
  security: {
    helmet: boolean;
    trustProxy: boolean;
  };
}

/**
 * Load and validate application configuration
 */
export const getAppConfig = (): AppConfig => {
  // Provide default values for development
  const nodeEnv = process.env.NODE_ENV || 'development';
  
  return {
    port: parseInt(process.env.PORT || '3002'),
    nodeEnv: nodeEnv as 'development' | 'production' | 'test',
    cors: {
      origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5173'],
      credentials: process.env.CORS_CREDENTIALS === 'true',
    },
    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
      max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
    },
    api: {
      prefix: process.env.API_PREFIX || '/api',
      version: process.env.API_VERSION || 'v1',
    },
    logging: {
      level: (process.env.LOG_LEVEL as any) || 'info',
      format: (process.env.LOG_FORMAT as any) || 'json',
    },
    security: {
      helmet: process.env.HELMET_ENABLED !== 'false',
      trustProxy: process.env.TRUST_PROXY === 'true',
    },
  };
};
