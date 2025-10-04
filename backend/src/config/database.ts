import { DataSource, DataSourceOptions } from 'typeorm';
import { Asset } from '../entities/Asset';
import { Portfolio } from '../entities/Portfolio';

/**
 * Database configuration with environment-based settings
 */
export const getDatabaseConfig = (): DataSourceOptions => {
  const isProduction = process.env.NODE_ENV === 'production';
  const isTest = process.env.NODE_ENV === 'test';

  // Build config object with conditional cache
  const config: any = {
    type: 'sqlite',
    database: isTest ? ':memory:' : process.env.DB_DATABASE || 'portfolio.db',
    synchronize: !isProduction, // Only auto-sync in development
    logging: process.env.DB_LOGGING === 'true',
    entities: [Asset, Portfolio],
    migrations: isProduction ? ['dist/migrations/*.js'] : undefined,
    migrationsRun: isProduction,
    extra: {
      // SQLite specific settings
      enableForeignKeys: true,
    },
  };

  // Only add Redis cache if Redis is available
  if (process.env.REDIS_HOST && process.env.REDIS_PORT) {
    config.cache = {
      type: 'redis',
      options: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
        password: process.env.REDIS_PASSWORD,
      },
      duration: 30000, // 30 seconds cache
    };
  }

  return config as DataSourceOptions;
};

/**
 * Create and configure the database connection
 */
export const createDataSource = (): DataSource => {
  return new DataSource(getDatabaseConfig());
};
