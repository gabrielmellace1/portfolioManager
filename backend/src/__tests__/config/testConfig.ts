import { DataSource } from 'typeorm';
import { Asset } from '../../entities/Asset';
import { Portfolio } from '../../entities/Portfolio';

export const createTestDataSource = (): DataSource => {
  return new DataSource({
    type: 'sqlite',
    database: ':memory:',
    synchronize: true,
    logging: false,
    entities: [Asset, Portfolio],
    dropSchema: true,
  });
};

export const testDatabaseConfig = {
  type: 'sqlite' as const,
  database: ':memory:',
  synchronize: true,
  logging: false,
  dropSchema: true,
};

export const testAppConfig = {
  port: 3001,
  nodeEnv: 'test',
  cors: {
    origin: ['http://localhost:3000'],
    credentials: true,
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  },
  security: {
    requestSizeLimit: '10mb',
    requestTimeout: 30000,
  },
};
