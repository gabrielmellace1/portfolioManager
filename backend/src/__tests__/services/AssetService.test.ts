import { DataSource } from 'typeorm';
import { AssetService } from '../../services/AssetService';
import { AssetRepository } from '../../repositories/AssetRepository';
import { PortfolioRepository } from '../../repositories/PortfolioRepository';
import { TestHelpers } from '../utils/testHelpers';
import { AssetType } from '../../entities/Asset';

describe('AssetService Integration Tests', () => {
  let dataSource: DataSource;
  let assetService: AssetService;
  let assetRepository: AssetRepository;
  let portfolioRepository: PortfolioRepository;

  beforeAll(async () => {
    dataSource = (global as any).testDataSource;
    assetRepository = new AssetRepository(dataSource);
    portfolioRepository = new PortfolioRepository(dataSource);
    assetService = new AssetService(assetRepository, portfolioRepository);
  });

  beforeEach(async () => {
    await TestHelpers.cleanupDatabase(dataSource);
  });

  describe('createAsset', () => {
    it('should create asset successfully', async () => {
      const portfolio = await TestHelpers.createTestPortfolio(dataSource);
      
      const assetData = {
        ticker: 'AAPL',
        name: 'Apple Inc.',
        type: AssetType.STOCK,
        quantity: 100,
        purchasePrice: 150.0,
        currentPrice: 150.0,
        purchaseDate: new Date('2023-01-01'),
        portfolioId: portfolio.id,
      };

      const result = await assetService.createAsset(assetData);

      expect(result).toBeDefined();
      expect(result.ticker).toBe('AAPL');
      expect(result.name).toBe('Apple Inc.');
      expect(result.quantity).toBe(100);
      expect(result.purchasePrice).toBe(150.0);
      expect(result.portfolioId).toBe(portfolio.id);
    });

    it('should throw error for non-existent portfolio', async () => {
      const assetData = {
        ticker: 'AAPL',
        name: 'Apple Inc.',
        type: AssetType.STOCK,
        quantity: 100,
        purchasePrice: 150.0,
        currentPrice: 150.0,
        purchaseDate: new Date('2023-01-01'),
        portfolioId: 999,
      };

      await expect(assetService.createAsset(assetData))
        .rejects.toThrow('Portfolio not found');
    });

    it('should throw error for duplicate ticker in same portfolio', async () => {
      const portfolio = await TestHelpers.createTestPortfolio(dataSource);
      
      const assetData = {
        ticker: 'AAPL',
        name: 'Apple Inc.',
        type: AssetType.STOCK,
        quantity: 100,
        purchasePrice: 150.0,
        currentPrice: 150.0,
        purchaseDate: new Date('2023-01-01'),
        portfolioId: portfolio.id,
      };

      await assetService.createAsset(assetData);

      await expect(assetService.createAsset(assetData))
        .rejects.toThrow('Asset with ticker AAPL already exists in this portfolio');
    });
  });

  describe('getAllAssets', () => {
    it('should return all assets', async () => {
      const portfolio = await TestHelpers.createTestPortfolio(dataSource);
      await TestHelpers.createTestAssets(dataSource, portfolio, 3);

      const assets = await assetService.getAllAssets();

      expect(assets).toHaveLength(3);
      expect(assets[0].ticker).toBe('TEST1');
      expect(assets[1].ticker).toBe('TEST2');
      expect(assets[2].ticker).toBe('TEST3');
    });

    it('should return assets with pagination', async () => {
      const portfolio = await TestHelpers.createTestPortfolio(dataSource);
      await TestHelpers.createTestAssets(dataSource, portfolio, 5);

      const result = await assetService.getAssetsWithPagination({
        page: 1,
        limit: 2,
      });

      expect(result.data).toHaveLength(2);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(2);
      expect(result.pagination.total).toBe(5);
      expect(result.pagination.totalPages).toBe(3);
    });
  });

  describe('getAssetById', () => {
    it('should return asset by id', async () => {
      const portfolio = await TestHelpers.createTestPortfolio(dataSource);
      const asset = await TestHelpers.createTestAsset(dataSource, portfolio);

      const result = await assetService.getAssetById(asset.id);

      expect(result).toBeDefined();
      expect(result.id).toBe(asset.id);
      expect(result.ticker).toBe('TEST');
    });

    it('should throw error for non-existent asset', async () => {
      await expect(assetService.getAssetById(999))
        .rejects.toThrow('Asset not found');
    });
  });

  describe('updateAsset', () => {
    it('should update asset successfully', async () => {
      const portfolio = await TestHelpers.createTestPortfolio(dataSource);
      const asset = await TestHelpers.createTestAsset(dataSource, portfolio);

      const updateData = {
        name: 'Updated Asset Name',
        quantity: 200,
        currentPrice: 200.0,
      };

      const result = await assetService.updateAsset(asset.id, updateData);

      expect(result.name).toBe('Updated Asset Name');
      expect(result.quantity).toBe(200);
      expect(result.currentPrice).toBe(200.0);
    });

    it('should throw error for non-existent asset', async () => {
      const updateData = {
        name: 'Updated Asset Name',
      };

      await expect(assetService.updateAsset(999, updateData))
        .rejects.toThrow('Asset not found');
    });
  });

  describe('deleteAsset', () => {
    it('should delete asset successfully', async () => {
      const portfolio = await TestHelpers.createTestPortfolio(dataSource);
      const asset = await TestHelpers.createTestAsset(dataSource, portfolio);

      await assetService.deleteAsset(asset.id);

      await expect(assetService.getAssetById(asset.id))
        .rejects.toThrow('Asset not found');
    });

    it('should throw error for non-existent asset', async () => {
      await expect(assetService.deleteAsset(999))
        .rejects.toThrow('Asset not found');
    });
  });

  describe('searchAssets', () => {
    it('should search assets by ticker', async () => {
      const portfolio = await TestHelpers.createTestPortfolio(dataSource);
      await TestHelpers.createTestAsset(dataSource, portfolio, { ticker: 'AAPL' });
      await TestHelpers.createTestAsset(dataSource, portfolio, { ticker: 'GOOGL' });

      const results = await assetService.searchAssets({
        query: 'AAPL',
        fields: ['ticker'],
      });

      expect(results).toHaveLength(1);
      expect(results[0].ticker).toBe('AAPL');
    });

    it('should search assets by name', async () => {
      const portfolio = await TestHelpers.createTestPortfolio(dataSource);
      await TestHelpers.createTestAsset(dataSource, portfolio, { 
        ticker: 'AAPL', 
        name: 'Apple Inc.' 
      });
      await TestHelpers.createTestAsset(dataSource, portfolio, { 
        ticker: 'GOOGL', 
        name: 'Alphabet Inc.' 
      });

      const results = await assetService.searchAssets({
        query: 'Apple',
        fields: ['name'],
      });

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Apple Inc.');
    });
  });

  describe('getPerformanceMetrics', () => {
    it('should return performance metrics', async () => {
      const portfolio = await TestHelpers.createTestPortfolio(dataSource);
      await TestHelpers.createTestAsset(dataSource, portfolio, {
        ticker: 'AAPL',
        quantity: 100,
        purchasePrice: 150.0,
        currentPrice: 160.0,
      });
      await TestHelpers.createTestAsset(dataSource, portfolio, {
        ticker: 'GOOGL',
        quantity: 50,
        purchasePrice: 200.0,
        currentPrice: 180.0,
      });

      const metrics = await assetService.getPerformanceMetrics();

      expect(metrics.totalAssets).toBe(2);
      expect(metrics.totalCost).toBe(25000); // (100*150) + (50*200)
      expect(metrics.currentValue).toBe(25000); // (100*160) + (50*180)
      expect(metrics.profitableAssets).toBe(1);
      expect(metrics.losingAssets).toBe(1);
    });
  });
});
