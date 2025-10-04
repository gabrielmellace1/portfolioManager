import { Portfolio } from '../../entities/Portfolio';
import { Asset } from '../../entities/Asset';
import { AssetType } from '../../entities/Asset';

describe('Portfolio Entity', () => {
  let portfolio: Portfolio;
  let assets: Asset[];

  beforeEach(() => {
    portfolio = new Portfolio();
    portfolio.id = 1;
    portfolio.name = 'Test Portfolio';
    portfolio.description = 'Test Description';
    portfolio.createdAt = new Date('2023-01-01');

    // Create test assets
    assets = [
      {
        id: 1,
        ticker: 'AAPL',
        name: 'Apple Inc.',
        type: AssetType.STOCK,
        quantity: 100,
        purchasePrice: 150.0,
        currentPrice: 160.0,
        purchaseDate: new Date('2023-01-01'),
        portfolio,
      } as Asset,
      {
        id: 2,
        ticker: 'GOOGL',
        name: 'Alphabet Inc.',
        type: AssetType.STOCK,
        quantity: 50,
        purchasePrice: 200.0,
        currentPrice: 180.0,
        purchaseDate: new Date('2023-01-01'),
        portfolio,
      } as Asset,
      {
        id: 3,
        ticker: 'TSLA',
        name: 'Tesla Inc.',
        type: AssetType.STOCK,
        quantity: 25,
        purchasePrice: 300.0,
        currentPrice: 350.0,
        purchaseDate: new Date('2023-01-01'),
        portfolio,
      } as Asset,
    ];

    // Mock the assets relationship
    Object.defineProperty(portfolio, 'assets', {
      get: () => assets,
      configurable: true,
    });
  });

  describe('Basic Properties', () => {
    it('should create portfolio with required properties', () => {
      expect(portfolio.name).toBe('Test Portfolio');
      expect(portfolio.description).toBe('Test Description');
      expect(portfolio.id).toBe(1);
    });
  });

  describe('Calculated Properties', () => {
    it('should calculate total cost correctly', () => {
      // AAPL: 100 * 150 = 15000
      // GOOGL: 50 * 200 = 10000
      // TSLA: 25 * 300 = 7500
      // Total: 32500
      expect(portfolio.totalCost).toBe(32500);
    });

    it('should calculate asset count', () => {
      expect(portfolio.assetCount).toBe(3);
    });

    it('should count profitable assets', () => {
      // AAPL: 160 > 150 (profitable)
      // GOOGL: 180 < 200 (not profitable)
      // TSLA: 350 > 300 (profitable)
      expect(portfolio.profitableAssetsCount).toBe(2);
    });

    it('should group assets by performance', () => {
      const performance = portfolio.assetsByPerformance;
      
      expect(performance.profitable).toHaveLength(2);
      expect(performance.losses).toHaveLength(1);
      expect(performance.profitable.map(a => a.ticker)).toContain('AAPL');
      expect(performance.profitable.map(a => a.ticker)).toContain('TSLA');
      expect(performance.losses.map(a => a.ticker)).toContain('GOOGL');
    });
  });

  describe('getPerformanceSummary', () => {
    it('should return performance summary', () => {
      const summary = portfolio.getPerformanceSummary();
      
      expect(summary).toEqual({
        totalAssets: 3,
        profitableAssets: 2,
        losingAssets: 1,
        totalCost: 32500,
        currentValue: 35000, // (100*160) + (50*180) + (25*350)
        totalProfit: 2500,
        profitPercentage: 7.69,
        bestPerformer: expect.objectContaining({
          ticker: 'TSLA',
          profitPercentage: 16.67,
        }),
        worstPerformer: expect.objectContaining({
          ticker: 'GOOGL',
          profitPercentage: -10,
        }),
      });
    });
  });

  describe('getSummary', () => {
    it('should return portfolio summary', () => {
      const summary = portfolio.getSummary();
      
      expect(summary).toEqual({
        id: 1,
        name: 'Test Portfolio',
        description: 'Test Description',
        totalAssets: 3,
        totalCost: 32500,
        currentValue: 35000,
        totalProfit: 2500,
        profitPercentage: 7.69,
        createdAt: portfolio.createdAt,
        lastUpdated: expect.any(Date),
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty portfolio', () => {
      const emptyPortfolio = new Portfolio();
      emptyPortfolio.id = 2;
      emptyPortfolio.name = 'Empty Portfolio';
      Object.defineProperty(emptyPortfolio, 'assets', {
        get: () => [],
        configurable: true,
      });

      expect(emptyPortfolio.assetCount).toBe(0);
      expect(emptyPortfolio.totalCost).toBe(0);
      expect(emptyPortfolio.profitableAssetsCount).toBe(0);
      expect(emptyPortfolio.assetsByPerformance.profitable).toHaveLength(0);
      expect(emptyPortfolio.assetsByPerformance.losses).toHaveLength(0);
    });

    it('should handle portfolio with zero-cost assets', () => {
      const zeroCostAsset = {
        id: 4,
        ticker: 'FREE',
        name: 'Free Asset',
        type: AssetType.STOCK,
        quantity: 100,
        purchasePrice: 0,
        currentPrice: 10.0,
        purchaseDate: new Date('2023-01-01'),
        portfolio,
      } as Asset;

      const portfolioWithZeroCost = new Portfolio();
      portfolioWithZeroCost.id = 3;
      portfolioWithZeroCost.name = 'Zero Cost Portfolio';
      Object.defineProperty(portfolioWithZeroCost, 'assets', {
        get: () => [zeroCostAsset],
        configurable: true,
      });

      expect(portfolioWithZeroCost.totalCost).toBe(0);
      expect(portfolioWithZeroCost.profitableAssetsCount).toBe(1);
    });
  });
});
