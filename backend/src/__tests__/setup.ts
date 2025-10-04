import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Asset } from '../entities/Asset';
import { Portfolio } from '../entities/Portfolio';

// Global test setup
beforeAll(async () => {
  // Setup test database
  const testDataSource = new DataSource({
    type: 'sqlite',
    database: ':memory:',
    synchronize: true,
    logging: false,
    entities: [Asset, Portfolio],
  });

  await testDataSource.initialize();
  
  // Make test database available globally
  (global as any).testDataSource = testDataSource;
});

afterAll(async () => {
  // Cleanup test database
  const testDataSource = (global as any).testDataSource;
  if (testDataSource) {
    await testDataSource.destroy();
  }
});

// Mock console methods in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
