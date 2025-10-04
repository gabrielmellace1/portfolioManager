import { Asset } from '../../entities/Asset';
import { Portfolio } from '../../entities/Portfolio';
import { AssetType, OptionType } from '../../entities/Asset';

describe('Asset Entity', () => {
  let portfolio: Portfolio;
  let asset: Asset;

  beforeEach(() => {
    portfolio = new Portfolio();
    portfolio.id = 1;
    portfolio.name = 'Test Portfolio';
    portfolio.description = 'Test Description';

    asset = new Asset();
    asset.id = 1;
    asset.ticker = 'AAPL';
    asset.name = 'Apple Inc.';
    asset.type = AssetType.STOCK;
    asset.quantity = 100;
    asset.purchasePrice = 150.0;
    asset.currentPrice = 160.0;
    asset.purchaseDate = new Date('2023-01-01');
    asset.portfolio = portfolio;
  });

  describe('Basic Properties', () => {
    it('should create asset with required properties', () => {
      expect(asset.ticker).toBe('AAPL');
      expect(asset.name).toBe('Apple Inc.');
      expect(asset.type).toBe(AssetType.STOCK);
      expect(asset.quantity).toBe(100);
      expect(asset.purchasePrice).toBe(150.0);
      expect(asset.currentPrice).toBe(160.0);
    });

    it('should have portfolio relationship', () => {
      expect(asset.portfolio).toBe(portfolio);
      expect(asset.portfolioId).toBe(1);
    });
  });

  describe('Calculated Properties', () => {
    it('should calculate total cost correctly', () => {
      expect(asset.totalCost).toBe(15000); // 100 * 150.0
    });

    it('should determine if asset is profitable', () => {
      expect(asset.isProfitable).toBe(true); // 160.0 > 150.0
    });

    it('should determine if asset is not profitable', () => {
      asset.currentPrice = 140.0;
      expect(asset.isProfitable).toBe(false);
    });

    it('should calculate days until expiration for options', () => {
      asset.type = AssetType.OPTION;
      asset.expirationDate = new Date('2024-12-31');
      const today = new Date();
      const expectedDays = Math.ceil((asset.expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      expect(asset.daysUntilExpiration).toBe(expectedDays);
    });

    it('should determine if option is expired', () => {
      asset.type = AssetType.OPTION;
      asset.expirationDate = new Date('2020-01-01');
      
      expect(asset.isExpired).toBe(true);
    });

    it('should determine if option is not expired', () => {
      asset.type = AssetType.OPTION;
      asset.expirationDate = new Date('2025-01-01');
      
      expect(asset.isExpired).toBe(false);
    });
  });

  describe('getSummary', () => {
    it('should return asset summary for stock', () => {
      const summary = asset.getSummary();
      
      expect(summary).toEqual({
        id: 1,
        ticker: 'AAPL',
        name: 'Apple Inc.',
        type: 'STOCK',
        quantity: 100,
        purchasePrice: 150.0,
        currentPrice: 160.0,
        totalCost: 15000,
        currentValue: 16000,
        profit: 1000,
        profitPercentage: 6.67,
        isProfitable: true,
      });
    });

    it('should return asset summary for option', () => {
      asset.type = AssetType.OPTION;
      asset.optionType = OptionType.CALL;
      asset.strikePrice = 155.0;
      asset.expirationDate = new Date('2024-12-31');
      
      const summary = asset.getSummary();
      
      expect(summary).toEqual({
        id: 1,
        ticker: 'AAPL',
        name: 'Apple Inc.',
        type: 'OPTION',
        optionType: 'CALL',
        quantity: 100,
        purchasePrice: 150.0,
        currentPrice: 160.0,
        strikePrice: 155.0,
        totalCost: 15000,
        currentValue: 16000,
        profit: 1000,
        profitPercentage: 6.67,
        isProfitable: true,
        daysUntilExpiration: expect.any(Number),
        isExpired: false,
      });
    });
  });

  describe('Option-specific Properties', () => {
    it('should handle call option', () => {
      asset.type = AssetType.OPTION;
      asset.optionType = OptionType.CALL;
      asset.strikePrice = 155.0;
      asset.expirationDate = new Date('2024-12-31');
      
      expect(asset.optionType).toBe(OptionType.CALL);
      expect(asset.strikePrice).toBe(155.0);
      expect(asset.expirationDate).toBeDefined();
    });

    it('should handle put option', () => {
      asset.type = AssetType.OPTION;
      asset.optionType = OptionType.PUT;
      asset.strikePrice = 155.0;
      asset.expirationDate = new Date('2024-12-31');
      
      expect(asset.optionType).toBe(OptionType.PUT);
      expect(asset.strikePrice).toBe(155.0);
    });
  });

  describe('Bond-specific Properties', () => {
    it('should handle bond with coupon rate', () => {
      asset.type = AssetType.BOND;
      asset.couponRate = 3.5;
      asset.maturityDate = new Date('2030-01-01');
      
      expect(asset.couponRate).toBe(3.5);
      expect(asset.maturityDate).toBeDefined();
    });
  });
});
