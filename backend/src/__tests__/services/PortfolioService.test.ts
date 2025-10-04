import { DataSource } from 'typeorm';
import { PortfolioService } from '../../services/PortfolioService';
import { PortfolioRepository } from '../../repositories/PortfolioRepository';
import { AssetRepository } from '../../repositories/AssetRepository';
import { TestHelpers } from '../utils/testHelpers';

describe('PortfolioService Integration Tests', () => {
  let dataSource: DataSource;
  let portfolioService: PortfolioService;
  let portfolioRepository: PortfolioRepository;
  let assetRepository: AssetRepository;

  beforeAll(async () => {
    dataSource = (global as any).testDataSource;
    portfolioRepository = new PortfolioRepository(dataSource);
    assetRepository = new AssetRepository(dataSource);
    portfolioService = new PortfolioService(portfolioRepository, assetRepository);
  });

  beforeEach(async () => {
    await TestHelpers.cleanupDatabase(dataSource);
  });

  describe('createPortfolio', () => {
    it('should create portfolio successfully', async () => {
      const portfolioData = {
        name: 'Test Portfolio',
        description: 'Test Description',
      };

      const result = await portfolioService.createPortfolio(portfolioData);

      expect(result).toBeDefined();
      expect(result.name).toBe('Test Portfolio');
      expect(result.description).toBe('Test Description');
    });

    it('should throw error for duplicate portfolio name', async () => {
      const portfolioData = {
        name: 'Test Portfolio',
        description: 'Test Description',
      };

      await portfolioService.createPortfolio(portfolioData);

      await expect(portfolioService.createPortfolio(portfolioData))
        .rejects.toThrow('Portfolio with name Test Portfolio already exists');
    });
  });

  describe('getAllPortfolios', () => {
    it('should return all portfolios', async () => {
      await TestHelpers.createTestPortfolio(dataSource, { name: 'Portfolio 1' });
      await TestHelpers.createTestPortfolio(dataSource, { name: 'Portfolio 2' });

      const portfolios = await portfolioService.getAllPortfolios();

      expect(portfolios).toHaveLength(2);
      expect(portfolios.map(p => p.name)).toContain('Portfolio 1');
      expect(portfolios.map(p => p.name)).toContain('Portfolio 2');
    });

    it('should return portfolios with pagination', async () => {
      // Create 5 test portfolios
      for (let i = 1; i <= 5; i++) {
        await TestHelpers.createTestPortfolio(dataSource, { name: `Portfolio ${i}` });
      }

      const result = await portfolioService.getPortfoliosWithPagination({
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

  describe('getPortfolioById', () => {
    it('should return portfolio by id', async () => {
      const portfolio = await TestHelpers.createTestPortfolio(dataSource);

      const result = await portfolioService.getPortfolioById(portfolio.id);

      expect(result).toBeDefined();
      expect(result.id).toBe(portfolio.id);
      expect(result.name).toBe('Test Portfolio');
    });

    it('should throw error for non-existent portfolio', async () => {
      await expect(portfolioService.getPortfolioById(999))
        .rejects.toThrow('Portfolio not found');
    });
  });

  describe('updatePortfolio', () => {
    it('should update portfolio successfully', async () => {
      const portfolio = await TestHelpers.createTestPortfolio(dataSource);

      const updateData = {
        name: 'Updated Portfolio Name',
        description: 'Updated Description',
      };

      const result = await portfolioService.updatePortfolio(portfolio.id, updateData);

      expect(result.name).toBe('Updated Portfolio Name');
      expect(result.description).toBe('Updated Description');
    });

    it('should throw error for non-existent portfolio', async () => {
      const updateData = {
        name: 'Updated Portfolio Name',
      };

      await expect(portfolioService.updatePortfolio(999, updateData))
        .rejects.toThrow('Portfolio not found');
    });
  });

  describe('deletePortfolio', () => {
    it('should delete portfolio successfully', async () => {
      const portfolio = await TestHelpers.createTestPortfolio(dataSource);

      await portfolioService.deletePortfolio(portfolio.id);

      await expect(portfolioService.getPortfolioById(portfolio.id))
        .rejects.toThrow('Portfolio not found');
    });

    it('should throw error for non-existent portfolio', async () => {
      await expect(portfolioService.deletePortfolio(999))
        .rejects.toThrow('Portfolio not found');
    });
  });

  describe('getPortfolioPerformance', () => {
    it('should return portfolio performance with assets', async () => {
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

      const performance = await portfolioService.getPortfolioPerformance(portfolio.id);

      expect(performance).toBeDefined();
      expect(performance.portfolio).toBeDefined();
      expect(performance.assets).toHaveLength(2);
      expect(performance.summary.totalAssets).toBe(2);
      expect(performance.summary.totalCost).toBe(25000); // (100*150) + (50*200)
    });

    it('should throw error for non-existent portfolio', async () => {
      await expect(portfolioService.getPortfolioPerformance(999))
        .rejects.toThrow('Portfolio not found');
    });
  });

  describe('getPortfolioStatistics', () => {
    it('should return portfolio statistics', async () => {
      await TestHelpers.createTestPortfolio(dataSource, { name: 'Portfolio 1' });
      await TestHelpers.createTestPortfolio(dataSource, { name: 'Portfolio 2' });

      const stats = await portfolioService.getPortfolioStatistics();

      expect(stats.totalPortfolios).toBe(2);
      expect(stats.totalAssets).toBe(0); // No assets created
      expect(stats.averageAssetsPerPortfolio).toBe(0);
    });
  });
});
