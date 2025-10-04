import { DataSource } from 'typeorm';
import { Asset } from '../../entities/Asset';
import { Portfolio } from '../../entities/Portfolio';
import { AssetType } from '../../entities/Asset';

export class TestHelpers {
  static async createTestPortfolio(dataSource: DataSource, overrides: Partial<Portfolio> = {}): Promise<Portfolio> {
    const portfolioRepo = dataSource.getRepository(Portfolio);
    const portfolio = portfolioRepo.create({
      name: 'Test Portfolio',
      description: 'Test portfolio for unit tests',
      ...overrides,
    });
    return await portfolioRepo.save(portfolio);
  }

  static async createTestAsset(
    dataSource: DataSource,
    portfolio: Portfolio,
    overrides: Partial<Asset> = {}
  ): Promise<Asset> {
    const assetRepo = dataSource.getRepository(Asset);
    const assetData = {
      ticker: 'TEST',
      name: 'Test Asset',
      type: AssetType.STOCK,
      quantity: 100,
      purchasePrice: 10.0,
      currentPrice: 12.0,
      purchaseDate: new Date(),
      portfolio,
      ...overrides,
    };
    const asset = assetRepo.create(assetData);
    return await assetRepo.save(asset);
  }

  static async createTestAssets(
    dataSource: DataSource,
    portfolio: Portfolio,
    count: number = 3
  ): Promise<Asset[]> {
    const assets: Asset[] = [];
    for (let i = 0; i < count; i++) {
      const asset = await this.createTestAsset(dataSource, portfolio, {
        ticker: `TEST${i + 1}`,
        name: `Test Asset ${i + 1}`,
        quantity: 100 + i * 10,
        purchasePrice: 10.0 + i,
        currentPrice: 12.0 + i,
      });
      assets.push(asset);
    }
    return assets;
  }

  static async cleanupDatabase(dataSource: DataSource): Promise<void> {
    await dataSource.getRepository(Asset).clear();
    await dataSource.getRepository(Portfolio).clear();
  }

  static generateRandomString(length: number = 10): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  static generateRandomEmail(): string {
    return `${this.generateRandomString(8)}@test.com`;
  }

  static generateRandomNumber(min: number = 1, max: number = 1000): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static generateRandomPrice(min: number = 1, max: number = 100): number {
    return parseFloat((Math.random() * (max - min) + min).toFixed(2));
  }

  static generateRandomDate(start: Date = new Date('2020-01-01'), end: Date = new Date()): Date {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  }

  static async waitFor(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static createMockRequest(overrides: any = {}): any {
    return {
      body: {},
      params: {},
      query: {},
      headers: {},
      ...overrides,
    };
  }

  static createMockResponse(): any {
    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      end: jest.fn().mockReturnThis(),
    };
    return res;
  }

  static createMockNext(): jest.Mock {
    return jest.fn();
  }
}
